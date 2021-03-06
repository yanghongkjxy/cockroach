import d3 from "d3";
import React from "react";
import { connect } from "react-redux";
import { createSelector } from "reselect";

import { nodesSummarySelector, NodesSummary } from "src/redux/nodes";
import { Bytes as formatBytes } from "src/util/format";
import { NodesOverview } from "src/views/cluster/containers/nodesOverview";
import createChartComponent from "src/views/shared/util/d3-react";
import capacityChart from "./capacity";

import "./cluster.styl";

// tslint:disable-next-line:variable-name
const CapacityChart = createChartComponent(capacityChart);

class ClusterTicker extends React.Component<{}, {}> {
  render() {
    return (
      <section className="section cluster-ticker">
        <h2>Cluster Overview</h2>
      </section>
    );
  }
}

interface CapacityUsageProps {
  usedCapacity: number;
  usableCapacity: number;
}

const formatPercentage = d3.format("0.1%");

class CapacityUsage extends React.Component<CapacityUsageProps, {}> {
  render() {
    const { usedCapacity, usableCapacity } = this.props;
    const usedPercentage = usableCapacity !== 0 ? usedCapacity / usableCapacity : 0;
    return (
      <div className="cluster-summary__section capacity-usage">
        <h3 className="cluster-summary__title">Capacity Usage</h3>
        <div className="cluster-summary__metric">{ formatPercentage(usedPercentage) }</div>
        <div className="cluster-summary__chart">
          <CapacityChart used={usedCapacity} usable={usableCapacity} />
        </div>
        <div className="cluster-summary__aside">
          <span className="label">Current Usage</span>
          <span className="value">{ formatBytes(usedCapacity) }</span>
        </div>
      </div>
    );
  }
}

const mapStateToCapacityUsageProps = createSelector(
  nodesSummarySelector,
  function (nodesSummary: NodesSummary) {
    const { capacityAvailable, capacityUsed } = nodesSummary.nodeSums;
    const usableCapacity = capacityAvailable + capacityUsed;
    return {
      usedCapacity: capacityUsed,
      usableCapacity: usableCapacity,
    };
  },
);

// tslint:disable-next-line:variable-name
const CapacityUsageConnected = connect(mapStateToCapacityUsageProps)(CapacityUsage);

interface NodeLivenessProps {
  liveNodes: number;
  suspectNodes: number;
  deadNodes: number;
}

class NodeLiveness extends React.Component<NodeLivenessProps, {}> {
  render() {
    const { liveNodes, suspectNodes, deadNodes } = this.props;
    return (
      <div className="cluster-summary__section node-liveness">
        <h3 className="cluster-summary__title">Node Liveness</h3>
        <div className="cluster-summary__metric live-nodes">{ liveNodes }</div>
        <div className="cluster-summary__label live-nodes">Live<br />Nodes</div>
        <div className={ "cluster-summary__metric suspect-nodes" + (suspectNodes ? " warning" : "") }>{ suspectNodes }</div>
        <div className="cluster-summary__label suspect-nodes">Suspect<br />Nodes</div>
        <div className={ "cluster-summary__metric dead-nodes" + (deadNodes ? " alert" : "") }>{ deadNodes }</div>
        <div className="cluster-summary__label dead-nodes">Dead<br />Nodes</div>
      </div>
    );
  }
}

const mapStateToNodeLivenessProps = createSelector(
  nodesSummarySelector,
  function (nodesSummary: NodesSummary) {
    const { nodeCounts } = nodesSummary.nodeSums;
    return {
      liveNodes: nodeCounts.healthy,
      suspectNodes: nodeCounts.suspect,
      deadNodes: nodeCounts.dead,
    };
  },
);

// tslint:disable-next-line:variable-name
const NodeLivenessConnected = connect(mapStateToNodeLivenessProps)(NodeLiveness);

interface ReplicationStatusProps {
  totalRanges: number;
  underReplicatedRanges: number;
  unavailableRanges: number;
}

class ReplicationStatus extends React.Component<ReplicationStatusProps, {}> {
  render() {
    const { totalRanges, underReplicatedRanges, unavailableRanges } = this.props;
    return (
      <div className="cluster-summary__section replication-status">
        <h3 className="cluster-summary__title">Replication Status</h3>
        <div className="cluster-summary__metric total-ranges">{ totalRanges }</div>
        <div className="cluster-summary__label total-ranges">Total<br />Ranges</div>
        <div className={ "cluster-summary__metric under-replicated-ranges" + (underReplicatedRanges ? " warning" : "") }>{ underReplicatedRanges }</div>
        <div className="cluster-summary__label under-replicated-ranges">Under-replicated<br />Ranges</div>
        <div className={ "cluster-summary__metric unavailable-ranges" + (unavailableRanges ? " alert" : "") }>{ unavailableRanges }</div>
        <div className="cluster-summary__label unavailable-ranges">Unavailable<br />Ranges</div>
      </div>
    );
  }
}

const mapStateToReplicationStatusProps = createSelector(
  nodesSummarySelector,
  function (nodesSummary: NodesSummary) {
    const { totalRanges, underReplicatedRanges, unavailableRanges } = nodesSummary.nodeSums;
    return {
      totalRanges: totalRanges,
      underReplicatedRanges: underReplicatedRanges,
      unavailableRanges: unavailableRanges,
    };
  },
);

// tslint:disable-next-line:variable-name
const ReplicationStatusConnected = connect(mapStateToReplicationStatusProps)(ReplicationStatus);

class ClusterSummary extends React.Component<{}, {}> {
  render() {
    return (
      <section className="cluster-summary">
        <CapacityUsageConnected />
        <NodeLivenessConnected />
        <ReplicationStatusConnected />
      </section>
    );
  }
}

/**
 * Renders the main content of the cluster visualization page.
 */
class ClusterOverview extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <div className="cluster-overview">
          <ClusterTicker />
          <ClusterSummary />
        </div>
        <NodesOverview />
      </div>
    );
  }
}

export { ClusterOverview as default };
