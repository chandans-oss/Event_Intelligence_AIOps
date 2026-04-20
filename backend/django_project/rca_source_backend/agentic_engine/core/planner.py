def planner_call(incident):
    device = incident["device"]
    res_name = incident.get("resoure_name","")
    top_hypo = incident.get('top_hypothesis') or {}
    print(top_hypo)
    if 'crc' in top_hypo.get("description", "").lower():
        dummy_response = {
            "plan_id": "PLAN-CRC-20491",
            "steps": [
                {
                "id": 1,
                "tool": "tsdb_query",
                "hypothesis": "H_CRC_PHYSICAL_CORRUPTION",
                "params": {
                    "query": [
                    "interface_input_errors_total{device='%s',iface='%s'}" % (device, res_name),
                    "interface_output_discards_total{device='%s',iface='%s'}" % (device, res_name),
                    "crc_errors_total{device='%s',iface='%s'}" % (device, res_name),
                    "input_signal_strength_dbm{device='%s',iface='%s'}" % (device, res_name)
                    ]
                },
                "why": "Check sustained spikes in CRC errors, input errors, discards, and signal degradation"
                },
                {
                "id": 2,
                "tool": "snmp_query",
                "hypothesis": "H_CRC_PHYSICAL_CORRUPTION",
                "params": {
                    "oids": [
                    "IF-MIB::ifInErrors.%s" % (res_name),
                    "IF-MIB::ifOutDiscards.%s" % (res_name),
                    "CISCO-ENTITY-SENSOR-MIB::entSensorValue.%s" % (res_name)
                    ],
                    "device": "%s" % (device)
                },
                "why": "Validate physical port health and optical/electrical signal via SNMP"
                },
                {
                "id": 3,
                "tool": "log_query",
                "hypothesis": "H_CRC_PHYSICAL_CORRUPTION",
                "params": {
                    "device": "%s" % (device),
                    "search": [
                    "CRC",
                    "input error",
                    "link flap",
                    "PHY error",
                    "transceiver fault",
                    "optical power low"
                    ]
                },
                "why": "Look for system logs indicating CRC bursts, link flaps, or transceiver faults"
                },
                {
                "id": 4,
                "tool": "config_check",
                "hypothesis": "H_CRC_PHYSICAL_CORRUPTION",
                "params": {
                    "device": "%s" % (device),
                    "checks": [
                    "speed/duplex mismatch on %s" % (res_name),
                    "verify transceiver type & DOM support",
                    "auto-negotiation status on %s" % (res_name)
                    ]
                },
                "why": "Detect configuration issues that commonly cause CRC and physical errors"
                },
                {
                "id": 5,
                "tool": "phy_test",
                "hypothesis": "H_CRC_PHYSICAL_CORRUPTION",
                "params": {
                    "device": "%s" % (device),
                    "interface": "%s" % (res_name),
                    "tests": ["cable_diagnostics", "optic_dom_check"]
                },
                "why": "Run cable/optic diagnostics to confirm hardware-level corruption"
                }
            ],
            "stop_when": "CRC/root-cause indicators confirmed OR score ≥ 0.85"
            }

    elif 'congestion' in top_hypo.get("description", "").lower():
        dummy_response = { "plan_id":"PLAN-10342", "steps":[ { "id":1, "tool":"tsdb_query", "hypothesis": "H_QOS_CONGESTION","params":{"query":["rate(ifHCOutOctets{device='%s',iface='%s'}[5m])*8"%(device, res_name),"qos_queue_tail_drops_total{device='%s',iface='%s'}"%(device,res_name)]}, "why":"Check sustained near line-rate and queue drops"}, { "id":2, "hypothesis": "H_QOS_CONGESTION","tool":"flow_query","params":{"filters":{"device":"%s"%(device)},"group_by":["application","dscp"]}, "why":"Check DSCP remarking"}, { "id":3, "hypothesis": "H_QOS_CONGESTION", "tool":"config_check","params":{"device":"%s"%(device),"checks":["service-policy output on %s"%(res_name)]}, "why":"Detect missing QoS policy"} ], "stop_when":"QoS triad confirmed OR conf≥0.8" } 
    else:
        dummy_response = {
            "plan_id": "PLAN-PHYSICAL-LAYER-GENERIC",
            "steps": [
                {
                "id": 1,
                "tool": "tsdb_query",
                "hypothesis": incident.get('top_hypothesis',""),
                "params": {
                    "query": [
                    "interface_input_errors_total{device='%s',iface='%s'}" % (device, res_name),
                    "interface_output_discards_total{device='%s',iface='%s'}" % (device, res_name),
                    "crc_errors_total{device='%s',iface='%s'}" % (device, res_name),
                    "input_signal_strength_dbm{device='%s',iface='%s'}" % (device, res_name),
                    "link_flaps_total{device='%s',iface='%s'}" % (device, res_name)
                    ]
                },
                "why": "Retrieve interface counters to confirm error trends, CRC spikes, and signal issues"
                },

                {
                "id": 2,
                "tool": "snmp_query",
                "hypothesis": incident.get('top_hypothesis',""),
                "params": {
                    "device": "%s" % (device),
                    "oids": [
                    "IF-MIB::ifInErrors.%s" % (res_name),
                    "IF-MIB::ifOutDiscards.%s" % (res_name),
                    "IF-MIB::ifInCRC.%s" % (res_name),
                    "CISCO-ENTITY-SENSOR-MIB::entSensorValue.%s" % (res_name)
                    ]
                },
                "why": "Validate error counters and physical transceiver/PHY status from SNMP"
                },

                {
                "id": 3,
                "tool": "log_query",
                "hypothesis": incident.get('top_hypothesis',""),
                "params": {
                    "device": "%s" % (device),
                    "search": [
                    "CRC",
                    "PHY error",
                    "link flap",
                    "LOS",
                    "LOF",
                    "input error",
                    "optic fault",
                    "transceiver warning"
                    ]
                },
                "why": "Check logs for link instability, CRC bursts, and optical/electrical faults"
                },

                {
                "id": 4,
                "tool": "config_check",
                "hypothesis": incident.get('top_hypothesis',""),
                "params": {
                    "device": "%s" % (device),
                    "checks": [
                    "verify speed and duplex settings on %s" % (res_name),
                    "check auto-negotiation status",
                    "validate transceiver type compatibility",
                    "check for MTU mismatch",
                    "confirm interface is not oversubscribed"
                    ]
                },
                "why": "Identify misconfigurations that commonly cause CRC errors or packet discards"
                }
            ],
            "stop_when": "Physical-layer fault indicators confirmed OR confidence ≥ 0.85"
            }

    return dummy_response
