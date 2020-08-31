import React from 'react';
import PropTypes from 'prop-types';
import compose from 'compose-function';
import { isEmpty } from 'lodash';
import { CalloutContext, stripesConnect } from '@folio/stripes/core';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import View from '../components/views/AgreementLineForm';
import { urls, withSuppressFromDiscovery } from '../components/utilities';

class AgreementLineCreateRoute extends React.Component {
  static manifest = Object.freeze({
    entitlements: {
      type: 'okapi',
      path: 'erm/entitlements',
      fetch: false,
    },
    basket: { initialValue: [] },
  });

  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    isSuppressFromDiscoveryEnabled: PropTypes.func.isRequired,
    location: PropTypes.shape({
      search: PropTypes.string.isRequired,
    }).isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        agreementId: PropTypes.string.isRequired,
        lineId: PropTypes.string.isRequired,
      }).isRequired
    }).isRequired,
    mutator: PropTypes.shape({
      entitlements: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }),
    resources: PropTypes.shape({
      basket: PropTypes.arrayOf(PropTypes.object),
      line: PropTypes.object,
      orderLines: PropTypes.object,
    }).isRequired,
    stripes: PropTypes.shape({
      hasInterface: PropTypes.func.isRequired,
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
  };

  static contextType = CalloutContext;

  constructor(props) {
    super(props);

    this.state = {
      isEholdingsEnabled: props.stripes.hasPerm('module.eholdings.enabled'),
    };
  }

  getCompositeLine = () => {
    const { resources } = this.props;
    const line = resources.line?.records?.[0] ?? {};
    const orderLines = resources.orderLines?.records || [];

    const poLines = (line.poLines || [])
      .map(linePOL => orderLines.find(orderLine => orderLine.id === linePOL.poLineId))
      .filter(poLine => poLine);

    return {
      ...line,
      poLines,
    };
  }

  handleClose = () => {
    const {
      history,
      location,
      match: { params: { agreementId, lineId } },
    } = this.props;
    history.push(`${urls.agreementLineView(agreementId, lineId)}${location.search}`);
  }

  handleSubmit = (line) => {
    const {
      match: { params: { agreementId } },
    } = this.props;

    let items;
    const { linkedResource: resource, ...rest } = line;
    if (resource?.type === 'packages') {
      items = {
        'type': 'external',
        'authority': 'ekb-package',
        'reference': resource.id,
        ...rest
      };
    } else if (resource?.type === 'resources') {
      items = {
        'type': 'external',
        'authority': 'ekb-title',
        'reference': resource.id,
        ...rest
      };
    } else if (isEmpty(resource)) items = { 'type': 'detached', ...rest, resource: null, coverage: [] }; // detached
    else items = { resource: line.linkedResource, ...rest };

    const {
      history,
      location,
      mutator,
    } = this.props;

    return mutator.entitlements
      .POST({ ...items, 'owner': agreementId })
      .then(({ id }) => {
        this.context.sendCallout({ message: <SafeHTMLMessage id="ui-agreements.line.create.callout" /> });
        history.push(`${urls.agreementLineView(agreementId, id)}${location.search}`);
      });
  }

  render() {
    const { resources, isSuppressFromDiscoveryEnabled } = this.props;

    return (
      <View
        data={{
          basket: (resources?.basket ?? []),
        }}
        handlers={{
          isSuppressFromDiscoveryEnabled,
          onClose: this.handleClose,
        }}
        isEholdingsEnabled={this.state.isEholdingsEnabled}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

export default compose(
  stripesConnect,
  withSuppressFromDiscovery,
)(AgreementLineCreateRoute);