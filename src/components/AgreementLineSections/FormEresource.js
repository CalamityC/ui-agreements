import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { Button } from '@folio/stripes/components';
import { Field } from 'react-final-form';
import { isDetached } from '../utilities';

import FormEresourceCard from './FormEresourceCard';
import BasketSelector from '../BasketSelector';
import EresourceSelector from './EresourceSelector';

const propTypes = {
  agreementLineSource: PropTypes.string,
  basket: PropTypes.arrayOf(PropTypes.object),
  onEresourceSelected: PropTypes.func,
  line: PropTypes.shape({
    poLines: PropTypes.arrayOf(PropTypes.object)
  }),
  lineId: PropTypes.string,
};

const FormEresource = ({
  agreementLineSource,
  basket,
  line,
  lineId,
}) => {
  const renderHandleUnLinkEresourceButton = (onChange) => {
    if (!isDetached(line) && lineId && !isEmpty(line)) return null;

    return (
      <Button
        buttonStyle="default"
        marginBottom0
        onClick={() => onChange({})}
      >
        <FormattedMessage id="ui-agreements.agreementLine.unlinkEresource" />
      </Button>
    );
  };

  const isExternal = (resource) => {
    return resource.type === 'external';
  };

  const required = (val, allValues) => {
    if (allValues.description?.length > 0 || (!isEmpty(val) && !isDetached(val))) {
      return undefined;
    }
    return <FormattedMessage id="ui-agreements.agreementLine.provideEresource" />;
  };

  const fieldProps = {
    addButtonLabel: <FormattedMessage id="ui-agreements.agreementLine.linkSelectedEresource" />,
    basket,
    label: <FormattedMessage id="ui-agreements.eresource" />,
  };

  return (
    <Field name="linkedResource" validate={required}>
      {({ input, meta }) => {
        const res = isExternal(input.value) ? input.value : (input.value.resource?._object ?? {});
        if (!isEmpty(input.value) && !isDetached(input.value)) {
          return (
            <FormEresourceCard
              component={FormEresourceCard}
              headerEnd={renderHandleUnLinkEresourceButton(input.onChange)}
              resource={!isDetached(line) && lineId && !isEmpty(line) ? res : input.value}
            />
          );
        } else if (agreementLineSource === '') {
          return null;
        } else if (agreementLineSource === 'basket') {
          return (
            <BasketSelector
              component={BasketSelector}
              error={meta.touched && meta.error}
              name={input.name}
              onAdd={resource => input.onChange(resource)}
              value={input.value}
              {...fieldProps}
            />
          );
        } else {
          return (
            <EresourceSelector
              component={EresourceSelector}
              error={meta.touched && meta.error}
              name={input.name}
              onAdd={resource => input.onChange(resource)}
              value={input.value}
            />
          );
        }
      }}
    </Field>
  );
};

FormEresource.propTypes = propTypes;
export default FormEresource;
