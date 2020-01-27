import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';
import { Layout } from '@folio/stripes/components';

export default class CoverageStatementsMonograph extends React.Component {
  static propTypes = {
    pci: PropTypes.shape({
      pti: PropTypes.shape({
        titleInstance: PropTypes.shape({
          dateMonographPublished: PropTypes.string,
          monographVolume: PropTypes.string,
          monographEdition: PropTypes.string,
          name: PropTypes.string
        }),
      }).isRequired
    }),
  }

  renderEdition(edition) {
    if (!edition) return null;

    return (
      <React.Fragment>
        <FormattedMessage id="ui-agreements.coverage.editionShort" />
        {edition}
      </React.Fragment>
    );
  }

  renderVolume(volume) {
    if (!volume) return null;

    return (
      <React.Fragment>
        <FormattedMessage id="ui-agreements.coverage.volumeShort" />
        {volume}
      </React.Fragment>
    );
  }

  renderCoverage(pci) {
    // Date can take the forms yyyy, yyyy-mm or yyyy-mm-dd, and is stored as a string.
    const date = get(pci, 'pti.titleInstance.dateMonographPublished');
    const volume = get(pci, 'pti.titleInstance.monographVolume');
    const edition = get(pci, 'pti.titleInstance.monographEdition');

    if (!date && !volume && !edition) {
      return '*';
    }
    return (
      <Layout
        className="margin-end-gutter textRight"
        data-test-start
        style={{ width: '40%' }}
      >
        { date }
        <div
          data-test-edition={edition}
          data-test-volume={volume}
        >
          {this.renderEdition(edition)}
          {volume && edition ? <React.Fragment>&nbsp;</React.Fragment> : null}
          {this.renderVolume(volume)}
        </div>
      </Layout>
    );
  }

  render() {
    const { pci } = this.props;
    const titleName = get(pci, 'pti.titleInstance.name');

    if (!pci) return '-';
    return <Layout className="full" data-test-coverage-statements={titleName}>{this.renderCoverage(pci)}</Layout>;
  }
}
