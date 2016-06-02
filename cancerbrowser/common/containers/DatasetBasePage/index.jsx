import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import {
  fetchDatasetIfNeeded,
  fetchDatasetInfo
} from '../../actions/dataset';

import {
  fetchCellLinesIfNeeded
} from '../../actions/cell_line';

import {
  changeActiveFilters,
  changeViewBy
} from '../../actions/datasetGrowthFactorPaktPerk';

import { ButtonGroup, Button } from 'react-bootstrap';
import PageLayout from '../../components/PageLayout';
import FilterPanel from '../../components/FilterPanel';

const propTypes = {
  datasetId: React.PropTypes.string,
  datasetKey: React.PropTypes.string,
  className: React.PropTypes.string,
  dispatch: React.PropTypes.func,
  datasetData: React.PropTypes.array,
  datasetInfo: React.PropTypes.object,
  activeFilters: React.PropTypes.object,
  filterGroups: React.PropTypes.array,
  filteredCellLines: React.PropTypes.array,
  cellLineCounts: React.PropTypes.object,
  viewBy: React.PropTypes.string,
  filteredData: React.PropTypes.array
};

export function baseMapStateToProps(state, { datasetId, datasetKey,
    getFilteredViewData, getFilterGroups }) {
  const { datasets, cellLines } = state;
  const datasetState = datasets[datasetKey];
  const dataset = datasets.datasetsById[datasetId];

  const props = {
    datasetId,
    datasetKey,
    datasetInfo: datasets.info.items[datasetId],
    datasetData: dataset && dataset.items,
    filteredCellLines: cellLines.filtered,
    cellLineCounts: cellLines.counts,
    activeFilters: datasetState.activeFilters,
    viewBy: datasetState.viewBy,
    filteredData: getFilteredViewData(state),
    filterGroups: getFilterGroups(state)
  };

  return props;
}

/**
 * React base container for a dataset page page, should be extended by other
 * pages, not instantiated directly.
 */
class DatasetBasePage extends React.Component {
  constructor(props) {
    super(props);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.renderViewOptions = this.renderViewOptions.bind(this);

    // can be overridden by subclass
    this.viewOptions = [];
  }

  componentDidMount() {
    const { datasetId, dispatch, activeFilters, filterGroups } = this.props;
    dispatch(fetchDatasetIfNeeded(datasetId));
    dispatch(fetchDatasetInfo(datasetId));
    dispatch(fetchCellLinesIfNeeded(activeFilters, filterGroups));
  }

  handleViewByChange(newView) {
    const { datasetId, dispatch } = this.props;
    dispatch(changeViewBy(newView));
    dispatch(fetchDatasetIfNeeded(datasetId, newView));
  }

  onFilterChange(newFilters) {
    const { dispatch, filterGroups } = this.props;
    dispatch(changeActiveFilters(newFilters));

    // TODO these should just be affected by cellLineFilters not all the filter groups...
    dispatch(fetchCellLinesIfNeeded(_.pick(newFilters, 'cellLineFilters'),
      filterGroups.filter(filterGroup => filterGroup.id === 'cellLineFilters')));
  }

  /**
   * Renders the side bar
   *
   * @return {React.Component}
   */
  renderSidebar() {
    const { activeFilters, cellLineCounts, filterGroups } = this.props;

    return (
      <FilterPanel
        filterGroups={filterGroups}
        activeFilters={activeFilters}
        counts={cellLineCounts}
        onFilterChange={this.onFilterChange} />
    );
  }

  renderViewOptions() {
    const { viewBy } = this.props;

    if (!this.viewOptions || !this.viewOptions.length) {
      return null;
    }

    return (
      <div className='cell-line-view-controls'>
        <label className='small-label'>View By</label>
        <div>
          <ButtonGroup>
            {this.viewOptions.map((option, i) => {
              return (
                <Button key={i} className={classNames({ active: viewBy === option.value })}
                   onClick={this.handleViewByChange.bind(this, option.value)}>
                  {option.label}
                </Button>
              );
            })}
          </ButtonGroup>
        </div>
      </div>
    );
  }

  renderMain() { /* template method */ }

  render() {
    const { datasetInfo, className } = this.props;

    return (
      <PageLayout className={className} sidebar={this.renderSidebar()}>
        <h1>{datasetInfo && datasetInfo.label}</h1>
        {this.renderViewOptions()}
        {this.renderMain()}
      </PageLayout>
    );
  }
}

DatasetBasePage.propTypes = propTypes;
DatasetBasePage.defaultProps = { className: 'DatabaseBasePage' };

export default DatasetBasePage;