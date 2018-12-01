// @flow

import React, { Component } from 'react';

import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';

import FormPayment from './components/form-payment';
import FooterValues from './components/FooterItems';
import SaleValues from './components/SaleValues';

import getErrorMessage, { ERROR_TYPES } from './errors';

type Props = {
  onCloseDialog: Function,
  setFieldValue: Function,
  handleSubmit: Function,
  paymentInfo: Object,
  discount: Object,
  isSubmitting: boolean,
  isOpen: boolean,
  inDebit: number,
  subtotal: string,
  total: string,
  mode: string,
};

type State = {
  isInDebit: boolean,
  error: string,
};

class SaleConfirmation extends Component<Props, State> {
  state = {
    shouldPrintReceipt: false,
    isInDebit: false,
    error: '$',
  };

  componentDidMount() {
    const { inDebit } = this.props;

    this.setState({
      isInDebit: inDebit > 0,
    });
  }

  onToggleInDebitCheckbox = (): void => {
    const { isInDebit } = this.state;

    this.setState({
      isInDebit: !isInDebit,
    });
  };

  onToggleShouldPrintReceiptCheckbox = (): void => {
    const { shouldPrintReceipt } = this.state;

    this.setState({
      shouldPrintReceipt: !shouldPrintReceipt,
    });
  };

  onSetPaymentInfo = (paymentInfo: Object): void => {
    const { setFieldValue } = this.props;

    setFieldValue('paymentInfo', paymentInfo);
  };

  setDebit = (): void => {
    const { setFieldValue } = this.props;
    const { error } = this.state;
    const { message } = error;

    let debit = 0;

    if (message) {
      const messageSplitted = message.split(' ');
      debit = messageSplitted[messageSplitted.length - 1];
    }

    setFieldValue('inDebit', parseFloat(debit));
  };

  setIfShouldPrintReceipt = (): void => {
    const { shouldPrintReceipt } = this.state;
    const { setFieldValue } = this.props;

    setFieldValue('shouldPrintReceipt', shouldPrintReceipt);
  };

  checkFullPayment = (accumulated: number): void => {
    const { total } = this.props;

    let error = '';

    if (accumulated > total) {
      this.setState({
        error: ERROR_TYPES.ABOVE_VALUE,
        isInDebit: false,
      });
      return;
    }

    if (accumulated < total) {
      const value = total - accumulated;
      error = getErrorMessage(ERROR_TYPES.BELOW_VALUE, value);
    }

    if (accumulated === total) {
      this.setState({
        isInDebit: false,
        error: '$',
      });
      return;
    }

    this.setState({
      error,
    });
  };

  renderTitle = (): Object => {
    const { mode } = this.props;

    const title = (mode === 'edit' ? 'Editar Pagamento' : 'Confirmar Pagamento');

    return (
      <DialogTitle
        id="alert-dialog-slide-title"
      >
        {title}
      </DialogTitle>
    );
  };

  renderSlide = (props: Object): Object => (
    <Slide
      direction="up"
      {...props}
    />
  );

  renderSaleValues = (): Object => {
    const { discount, subtotal, total } = this.props;

    return (
      <SaleValues
        discount={discount}
        subtotal={subtotal}
        total={total}
      />
    );
  };

  renderFormPayment = (): Object => {
    const { paymentInfo } = this.props;

    return (
      <FormPayment
        checkFullPayment={this.checkFullPayment}
        onSetPaymentInfo={this.onSetPaymentInfo}
        paymentInfo={paymentInfo}
      />
    );
  };

  renderFooterValues = (): Object => {
    const { shouldPrintReceipt, isInDebit, error } = this.state;
    const { mode } = this.props;

    const shouldShowFooterValues = (error !== ERROR_TYPES.ABOVE_VALUE);

    return (
      <FooterValues
        onToggleShouldPrintReceiptCheckbox={this.onToggleShouldPrintReceiptCheckbox}
        onToggleInDebitCheckbox={this.onToggleInDebitCheckbox}
        shouldRenderDebitCheckbox={shouldShowFooterValues}
        shouldPrintReceipt={shouldPrintReceipt}
        isInDebit={isInDebit}
        error={error.message}
        mode={mode}
      />
    );
  };

  renderContent = (): Object => (
    <DialogContent>
      {this.renderSaleValues()}
      {this.renderFormPayment()}
      {this.renderFooterValues()}
    </DialogContent>
  );

  renderActionButtons = (): Object => {
    const { onCloseDialog, handleSubmit, isSubmitting } = this.props;
    const { isInDebit, error } = this.state;

    const isTotalPaymentBelow = (error.type === ERROR_TYPES.BELOW_VALUE) && !isInDebit;

    const shouldDisableOkButton = (isSubmitting || isTotalPaymentBelow);

    const onClickOk = () => {
      this.setDebit();
      this.setIfShouldPrintReceipt();
      handleSubmit();
    };

    return (
      <DialogActions>
        <Button
          onClick={() => {
            this.setState({
              error: '$',
            }, () => onCloseDialog());
          }}
          color="primary"
        >
          CANCELAR
        </Button>
        <Button
          disabled={shouldDisableOkButton}
          onClick={onClickOk}
          color="primary"
        >
          OK
        </Button>
      </DialogActions>
    );
  };

  render() {
    const { onCloseDialog, isOpen } = this.props;

    return (
      <Dialog
        aria-describedby="alert-dialog-slide-description"
        aria-labelledby="alert-dialog-slide-title"
        TransitionComponent={this.renderSlide}
        onClose={onCloseDialog}
        keepMounted={false}
        open={isOpen}
        maxWidth="sm"
        fullWidth
      >
        {this.renderTitle()}
        {this.renderContent()}
        {this.renderActionButtons()}
      </Dialog>
    );
  }
}

export default SaleConfirmation;
