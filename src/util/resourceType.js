import React from 'react';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

const PACKAGE_CLASS = 'org.olf.kb.Pkg';

const isPackage = (resource) => {
  return resource.class === PACKAGE_CLASS;
};

const renderResourceType = (resource) => {
  if (isPackage(resource)) return <FormattedMessage id="ui-agreements.eresources.package" />;

  return get(
    resource,
    ['_object', 'pti', 'titleInstance', 'type', 'label'],
    <FormattedMessage id="ui-agreements.eresources.title" />
  );
};

const renderResourceSourceKb = (resource) => {

  if (isPackage(resource)) 
    return get( resource, ['_object', 'remoteKb', 'name'], '-');
  return get( resource, ['_object', 'pkg', 'remoteKb', 'name'], '-');
};


export {
  isPackage,
  renderResourceType,
  renderResourceSourceKb
};
