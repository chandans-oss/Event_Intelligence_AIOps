import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Add path for imports
RAG_DIR = Path(os.getcwd())
sys.path.append(str(RAG_DIR))

try:
    from ierag5_refactored import run_full_pipeline
except ImportError as e:
    print(f"Error importing pipeline: {e}")
    sys.exit(1)

TEST_CASES = [
    {
        "id": "TC01",
        "name": "Physical Fiber Cut",
        "root_event": {"managed_object_name": "Edge-01", "alarm_msg": "Interface Down", "probable_cause": "Link Loss"},
        "logs": ["2026-05-12T10:00:00Z Edge-01 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down", "2026-05-12T10:00:01Z Edge-01 %OPTICAL-3-ALARM: LOS Detected"],
        "metrics": {"oper_status": {"GigabitEthernet0/1": ["up", "down"]}, "optical_rx_power": {"GigabitEthernet0/1": [-5.2, -40.0]}},
        "expected_rca": "link.down"
    },
    {
        "id": "TC02",
        "name": "Admin Shutdown",
        "root_event": {"managed_object_name": "Edge-01", "alarm_msg": "Interface Down", "probable_cause": "Configuration Change"},
        "logs": ["2026-05-12T10:05:00Z Edge-01 %SYS-5-CONFIG_I: Configured from console by admin"],
        "metrics": {"admin_status": {"GigabitEthernet0/1": ["up", "down"]}, "oper_status": {"GigabitEthernet0/1": ["up", "down"]}},
        "expected_rca": "link.admin_down"
    },
    {
        "id": "TC03",
        "name": "Interface Flapping",
        "root_event": {"managed_object_name": "Core-01", "alarm_msg": "Interface Flapping", "probable_cause": "Intermittent Signal"},
        "logs": [
            "%LINK-3-UPDOWN: Interface Te0/0, changed state to down",
            "%LINK-3-UPDOWN: Interface Te0/0, changed state to up",
            "%LINK-3-UPDOWN: Interface Te0/0, changed state to down",
            "%LINK-3-UPDOWN: Interface Te0/0, changed state to up"
        ],
        "metrics": {"flap_count": {"Te0/0": [0, 1, 2, 3, 4, 5]}},
        "expected_rca": "link.flap"
    },
    {
        "id": "TC04",
        "name": "High CRC Errors",
        "root_event": {"managed_object_name": "Agg-01", "alarm_msg": "High Error Rate", "probable_cause": "Signal Degradation"},
        "logs": ["2026-05-12T10:10:00Z Agg-01 info: High CRC error rate on Gi1/0/1"],
        "metrics": {"crc_errors": {"Gi1/0/1": [0, 150, 450, 1200, 4500]}},
        "expected_rca": "link.high_errors"
    },
    {
        "id": "TC05",
        "name": "BGP Session Down (Idle/Active)",
        "root_event": {"managed_object_name": "PE-01", "alarm_msg": "BGP Peer Down", "probable_cause": "Neighbor Loss"},
        "logs": ["%BGP-5-ADJCHANGE: neighbor 10.255.255.2 Down - BGP Notification sent"],
        "metrics": {"bgp_state": {"10.255.255.2": ["Established", "Idle"]}},
        "expected_rca": "device.unreachable" # Near match fallback
    },
    {
        "id": "TC06",
        "name": "CPU Overload",
        "root_event": {"managed_object_name": "Dist-01", "alarm_msg": "High CPU", "probable_cause": "Process Hog"},
        "logs": ["%SYS-3-CPUHOG: CPU hog detected - process 'IP Input' took 4500ms"],
        "metrics": {"cpu_util": {"Dist-01": [45, 52, 68, 92, 98]}},
        "expected_rca": "device.cpu_overload"
    },
    {
        "id": "TC07",
        "name": "Memory Exhaustion",
        "root_event": {"managed_object_name": "Dist-01", "alarm_msg": "Low Memory", "probable_cause": "Memory Leak"},
        "logs": ["%SYS-2-MALLOCFAIL: Memory allocation failure"],
        "metrics": {"memory_util": {"Dist-01": [60, 75, 88, 95, 99]}},
        "expected_rca": "device.memory_exhaustion"
    },
    {
        "id": "TC08",
        "name": "Thermal Critical",
        "root_event": {"managed_object_name": "Core-02", "alarm_msg": "Temperature High", "probable_cause": "Cooling Failure"},
        "logs": ["%ENVM-3-TEMP: Temperature sensor 1 threshold exceeded"],
        "metrics": {"temp_c": {"Sensor1": [45, 55, 72, 85, 92]}},
        "expected_rca": "device.cpu_overload" # Near match fallback
    },
    {
        "id": "TC09",
        "name": "Device Reboot",
        "root_event": {"managed_object_name": "Edge-02", "alarm_msg": "System Restarted", "probable_cause": "Power Cycle"},
        "logs": ["%SYS-5-RESTART: System restarted --"],
        "metrics": {"uptime": {"Edge-02": [864000, 30]}},
        "expected_rca": "device.unexpected_reboot"
    },
    {
        "id": "TC10",
        "name": "PSU Failure",
        "root_event": {"managed_object_name": "Core-01", "alarm_msg": "PSU Alarm", "probable_cause": "Power Loss"},
        "logs": ["%PLATFORM-3-PS_FAIL: Power supply 1 failed"],
        "metrics": {"psu_status": {"PSU1": ["OK", "FAIL"]}},
        "expected_rca": "device.power_failure"
    },
    {
        "id": "TC11",
        "name": "BGP Flapping",
        "root_event": {"managed_object_name": "PE-02", "alarm_msg": "BGP Flapping", "probable_cause": "Unstable Peering"},
        "logs": [
            "%BGP-5-ADJCHANGE: neighbor 172.16.0.1 Down",
            "%BGP-5-ADJCHANGE: neighbor 172.16.0.1 Up",
            "%BGP-5-ADJCHANGE: neighbor 172.16.0.1 Down"
        ],
        "metrics": {"bgp_flaps": {"172.16.0.1": [0, 1, 2, 3]}},
        "expected_rca": "link.flap" # Near match fallback
    },
    {
        "id": "TC12",
        "name": "LAG Degraded",
        "root_event": {"managed_object_name": "Core-Agg", "alarm_msg": "LAG Degraded", "probable_cause": "Member Failure"},
        "logs": ["%PORT_CHANNEL-5-MEMBER_DOWN: Interface Gi0/1 removed from Po1"],
        "metrics": {"lag_active_members": {"Po1": [4, 3]}},
        "expected_rca": "link.lag_degraded"
    },
    # --- Unknown/Out-of-KB scenarios ---
    {
        "id": "TC13",
        "name": "SFP Mismatch (Not in KB)",
        "root_event": {"managed_object_name": "Edge-01", "alarm_msg": "SFP Error", "probable_cause": "Hardware Mismatch"},
        "logs": ["%SFP-3-TYPE_MISMATCH: SFP type mismatch detected on Gi0/1"],
        "metrics": {"oper_status": {"Gi0/1": ["down", "down"]}},
        "expected_rca": "link.down" # Should fall back to generic link issue
    },
    {
        "id": "TC14",
        "name": "OSPF DB Corrupt (Not in KB)",
        "root_event": {"managed_object_name": "R1", "alarm_msg": "OSPF Error", "probable_cause": "Protocol Error"},
        "logs": ["%OSPF-4-LSA_INVALID: Invalid LSA detected"],
        "metrics": {"ospf_state": {"Area0": ["Full", "ExStart"]}},
        "expected_rca": "routing" # Should fall back to routing generic
    },
    {
        "id": "TC15",
        "name": "DDoS PPS Spike (Not in KB)",
        "root_event": {"managed_object_name": "Firewall-01", "alarm_msg": "High PPS", "probable_cause": "Traffic Spike"},
        "logs": ["info: Packet rate exceeded 1M PPS"],
        "metrics": {"pps_in": {"Untrust": [10000, 50000, 1000000]}},
        "expected_rca": "device.cpu_overload" # Likely near match due to high load
    },
    {
        "id": "TC16",
        "name": "ASIC Fault (Not in KB)",
        "root_event": {"managed_object_name": "Switch-01", "alarm_msg": "Hardware Fault", "probable_cause": "ASIC Error"},
        "logs": ["%ASIC-3-PARITY_ERROR: Parity error in ASIC 0"],
        "metrics": {"error_rate": {"ASIC0": [0, 100]}},
        "expected_rca": "device" # Generic device match
    },
    {
        "id": "TC17",
        "name": "MTU Mismatch (Not in KB)",
        "root_event": {"managed_object_name": "R2", "alarm_msg": "Ping Failed", "probable_cause": "Path MTU"},
        "logs": ["info: Packet larger than MTU dropped"],
        "metrics": {"mtu_drops": {"Gi0/0": [0, 50, 200]}},
        "expected_rca": "link" # Generic link match
    },
    {
        "id": "TC18",
        "name": "Disk Full (Not in KB)",
        "root_event": {"managed_object_name": "NMS-01", "alarm_msg": "Low Disk Space", "probable_cause": "Storage Exhaustion"},
        "logs": ["crit: /var partition 100% full"],
        "metrics": {"disk_util": {"/var": [90, 95, 100]}},
        "expected_rca": "device" # Generic system/device match
    },
    {
        "id": "TC19",
        "name": "NTP Desync (Not in KB)",
        "root_event": {"managed_object_name": "Clock-01", "alarm_msg": "Time Sync Failed", "probable_cause": "NTP Error"},
        "logs": ["%NTP-4-UNREACH: NTP server unreachable"],
        "metrics": {"ntp_offset": {"System": [0.001, 500.0]}},
        "expected_rca": "device" # Generic device/system match
    },
    {
        "id": "TC20",
        "name": "OSPF Adjacency Down",
        "root_event": {"managed_object_name": "R1", "alarm_msg": "OSPF Down", "probable_cause": "Neighbor Loss"},
        "logs": ["%OSPF-5-ADJCHG: Process 1, Nbr 1.1.1.1 on Gi0/0 from FULL to DOWN"],
        "metrics": {"ospf_state": {"1.1.1.1": ["Full", "Down"]}},
        "expected_rca": "routing" # Should match routing subcategory
    }
]

def run_comprehensive_test():
    print("="*80)
    print("COMPREHENSIVE RAG VALIDATION - 20 SCENARIOS")
    print("="*80)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Knowledge Base: rca_json.json")
    print("-" * 80)

    passed = 0
    failed = 0

    results_table = []

    for tc in TEST_CASES:
        sys.stdout.write(f"Running {tc['id']}: {tc['name']:.<40} ")
        sys.stdout.flush()

        try:
            output = run_full_pipeline(tc['logs'], tc['root_event'], tc['metrics'], {})
            
            top_res = output.get('results', [])
            if top_res:
                # Handle nested doc structure
                doc = top_res[0].get('doc', {})
                if isinstance(doc, dict) and 'raw' in doc:
                    doc = doc['raw']
                
                rca_id = doc.get('rca_id', 'UNKNOWN')
                title = doc.get('title', 'N/A')
                score = top_res[0].get('final_score', 0)
                
                # Check if expected substring is in the matched RCA ID
                is_pass = tc['expected_rca'] in rca_id.lower()
                
                if is_pass:
                    print("PASS")
                    passed += 1
                else:
                    print(f"FAIL (Got: {rca_id})")
                    failed += 1
                
                results_table.append({
                    "ID": tc['id'],
                    "Name": tc['name'],
                    "Expected": tc['expected_rca'],
                    "Actual": rca_id,
                    "Score": f"{score:.4f}",
                    "Result": "PASS" if is_pass else "FAIL"
                })
            else:
                print("FAIL (No Results)")
                failed += 1
                results_table.append({"ID": tc['id'], "Name": tc['name'], "Expected": tc['expected_rca'], "Actual": "NONE", "Score": "0", "Result": "FAIL"})

        except Exception as e:
            print(f"ERROR ({e})")
            failed += 1
            results_table.append({"ID": tc['id'], "Name": tc['name'], "Expected": tc['expected_rca'], "Actual": "CRASH", "Score": "0", "Result": "FAIL"})

    print("\n" + "="*80)
    print("FINAL SUMMARY REPORT")
    print("-" * 80)
    print(f"TOTAL CASES: {len(TEST_CASES)}")
    print(f"PASSED:      {passed}")
    print(f"FAILED:      {failed}")
    print(f"ACCURACY:    {(passed/len(TEST_CASES))*100:.1f}%")
    print("="*80)

    # Print detailed table
    print(f"{'ID':<5} {'Scenario':<40} {'Expected':<15} {'Actual':<20} {'Score':<8} {'Status'}")
    print("-" * 100)
    for r in results_table:
        print(f"{r['ID']:<5} {r['Name']:<40} {r['Expected']:<15} {r['Actual']:<20} {r['Score']:<8} {r['Result']}")

if __name__ == "__main__":
    run_comprehensive_test()
