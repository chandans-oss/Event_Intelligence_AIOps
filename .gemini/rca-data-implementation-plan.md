# Comprehensive RCA Data Implementation Plan

## Overview
Creating detailed, realistic, and distinct RCA data for all 13 cluster scenarios in the application.

## Cluster Scenarios & Data Strategy

### ✅ Already Detailed
1. **CLU-LC-001**: Link Congestion (Backup-Induced) - COMPLETE
2. **RCA-LC-001-A**: Backup-Induced Congestion (95%) - COMPLETE  
3. **RCA-LC-001-B**: Microburst Traffic (65%) - COMPLETE
4. **RCA-LC-001-C**: Interface Duplex Mismatch (35%) - COMPLETE

### 🔧 To Be Detailed (Priority Order)

#### HIGH PRIORITY - Network Infrastructure Failures

**CLU-002: Fiber Cut**
- Type: Physical layer failure
- Root Cause: Excavation damage to fiber optic cable
- Key Evidence: Optical LOS alarm, rapid light level drop, construction activity correlation
- Remediation: Field technician dispatch, fiber splice repair
- Impact: 450 users offline, VoIP down
- Unique Aspects: External event correlation, physical repair workflow

**CLU-003: Power Supply Failure**  
- Type: Hardware failure
- Root Cause: PSU-1 failure on Core-R2 causing electrical instability
- Key Evidence: Power alarm, voltage drop telemetry, redundancy switchover logs
- Remediation: Hot-swap PSU replacement, validate redundancy
- Impact: Risk of device failure, reduced redundancy
- Unique Aspects: Hardware health monitoring, environmental data

**CLU-004: Traffic Flood/DDoS**
- Type: Security/Performance
- Root Cause: Ingress packet storm causing CPU exhaustion
- Key Evidence: CPU spike to 98%, packet rate 10x normal, source IP analysis
- Remediation: Rate limiting, ACL deployment, upstream mitigation
- Impact: Control plane degradation, service slowdown
- Unique Aspects: Security correlation, attack pattern analysis

**CLU-005: Switching Loop**
- Type: Layer 2 topology issue  
- Root Cause: STP failure causing broadcast storm
- Key Evidence: MAC flapping, exponential traffic increase, duplicate frames
- Remediation: Identify and disable loop port, STP reconfiguration
- Impact: VLAN 100 down, broadcast domain saturated
- Unique Aspects: Layer 2 topology analysis, MAC table forensics

**CLU-006: Transceiver Failure**
- Type: Hardware/Optical
- Root Cause: SFP module failure on Gi0/2/0
- Key Evidence: TX power degradation, DOM thresholds exceeded, checksum errors
- Remediation: Replace SFP module, verify optics
- Impact: Link redundancy lost, single point of failure
- Unique Aspects: Optical diagnostics (DDM/DOM), aging component analysis

**CLU-007: Driver Bug**
- Type: Software defect
- Root Cause: Memory leak in linecard driver
- Key Evidence: Memory growth over time, buffer allocation failures, crash dumps
- Remediation: Apply software patch, schedule reload
- Impact: Interface crashes, packet drops
- Unique Aspects: Bug signature matching, version correlation

#### MEDIUM PRIORITY - Application/Service Failures

**CLU-12345: Database Connection Exhaustion**
- Type: Application failure
- Root Cause: Connection leak in payment service
- Key Evidence: Connection pool metrics, thread dumps, transaction timeouts
- Remediation: Restart connection pool, deploy leak fix
- Impact: Payment processing down, customer transactions failing
- Unique Aspects: Application-level diagnostics, connection pool analytics

**CLU-12346: Disk Full**
- Type: Storage exhaustion
- Root Cause: Log rotation script failure
- Key Evidence: Disk utilization 99%, inode exhaustion, failed cleanup jobs
- Remediation: Emergency log pruning, fix rotation script
- Impact: Unable to write logs, application errors
- Unique Aspects: Filesystem analysis, log management automation

**CLU-12347: Network Latency (BGP)**
- Type: Routing protocol issue
- Root Cause: BGP route flapping with external peer
- Key Evidence: BGP state transitions, route withdrawal/announcement cycles, RTT spikes
- Remediation: Dampen flapping peer, investigate peer network
- Impact: Intermittent connectivity, packet loss
- Unique Aspects: BGP timeline analysis, peer relationship diagnostics

**CLU-12348: Memory Exhaustion**  
- Type: Resource exhaustion
- Root Cause: JVM heap memory leak
- Key Evidence: Heap usage growth, GC overhead, OutOfMemory errors
- Remediation: Increase heap size, deploy memory leak fix
- Impact: Application crashes, degraded performance
- Unique Aspects: JVM diagnostics, heap dump analysis

**CLU-12349: SSL Certificate Expiry**
- Type: Configuration/operational
- Root Cause: Expired SSL certificate on proxy
- Key Evidence: Certificate validity check, handshake failures, browser errors
- Remediation: Renew and deploy new certificate
- Impact: HTTPS connections failing, user lockout
- Unique Aspects: Certificate lifecycle management, monitoring gaps

**CLU-12350: CPU Spike**
- Type: Performance
- Root Cause: Run away process consuming resources
- Key Evidence: CPU utilization 98%, specific PID identified, abnormal thread activity
- Remediation: Kill runaway process, identify root cause
- Impact: Server slowdown, request timeouts
- Unique Aspects: Process forensics, resource allocation analysis

## Data Structure for Each Cluster

Each detailed cluster will include:

### 1. **Metadata** (rcaMetadata)
- Event ID, type, timestamp, device, severity
- Realistic timestamps with progression
- Device naming following network conventions

### 2. **Summary & Root Cause** (rcaSummary, rootCause)
- 2-3 sentence technical summary
- Specific root cause statement
- Confidence score (0.85-0.98 based on evidence quality)

### 3. **RCA Process Steps** (5-6 steps)
- Orchestration: Initial detection and goal
- Intent Routing: Classification and intent matching  
- Hypothesis Scorer: Multiple hypotheses ranked
- Data Correlator: Historical pattern matching
- RCA Engine: Final determination
- Each with specific KPIs, evidence, and outputs

### 4. **Data Evidence** (3-5 sources)
- Metrics, Logs, Events tailored to failure type
- Realistic sample data (actual commands, values)
- Relevance scores 85-99
- Evidence count reflecting data volume

### 5. **Correlated Child Events** (3-5 events)
- Causally related alarms
- Correlation scores 0.85-0.97
- Correlation reasoning (temporal, spatial, causal)
- Realistic event progression

### 6. **Impacted Assets** (2-5 assets)
- Services, devices, user groups affected
- Severity (Critical/Major/Minor)
- Status (specific to failure type)
- Dependency chain

### 7. **Impact Topology**
- 4-6 nodes showing failure propagation
- Edges showing dependency/impact relationships
- Status reflecting failure state
- Realistic network hierarchy

### 8. **Remediation Steps** (5-7 steps)
- Immediate, Temporary, Long-term phases
- Mix of automated and manual
- Specific commands (actual CLI syntax where applicable)
- Verification criteria
- Realistic durations

### 9. **Knowledge Base References**
- 2-3 relevant KB articles
- Relevance scores
- Realistic titles

## Implementation Approach

1. Create detailed data constants for each cluster
2. Replace `createPlaceholderData()` calls with actual data
3. Ensure each scenario has unique:
   - Technical details
   - Evidence types
   - Remediation approach
   - Impacted services
4. Validate data consistency and realism

## Estimated Scope
- **Lines of Code**: ~3500 lines of detailed data
- **Time to Implement**: Significant effort
- **Value**: Professional-grade demo with realistic scenarios

---

**Status**: Implementation in progress
**Next Step**: Create detailed data for CLU-002 through CLU-007 (network failures)
