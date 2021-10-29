import { Component, h, Host, Method, Prop, State } from '@stencil/core';
import { fromError, get as getStack } from 'stacktrace-js';

const genErrorReport = async (repo: string, error: any) => {
  const errorTraces = await fromError(error);
  const curTraces = await getStack({});

  const reports = [];
  reports.push(new Date().toISOString(), repo, '', error['message'] || '(No Message)', '');
  if (Object.keys(error).length > 0) {
    reports.push(JSON.stringify(error), '');
  }
  reports.push(
    '## Stack',
    ...errorTraces.map(v => v.toString()),
    '',
    '## Current Stack',
    ...curTraces.map(v => v.toString()),
  );

  return reports.join('\r\n');
};

@Component({
  tag: 'ap-error',
  styleUrl: 'ap-error.scss',
})
export class ApError {
  @Prop()
  msgs: {
    main: string;
    close: string;
    showErrors: string;
    datetime: (d: number) => string;
  } = {
    main: 'Woops!\nPlease try again later',
    close: 'Close',
    showErrors: 'Show errors',
    datetime: (d: number) => {
      return new Date(d).toLocaleString();
    },
  };

  @Prop()
  repo!: string;

  @State()
  show = false;

  @State()
  showErrors = false;

  @Method()
  async showError(error: any) {
    this.errorDetail = await genErrorReport(this.repo, error);
    this.show = true;
    this.showErrors = false;
  }

  private errorDetail?: string;

  private handleClose = () => {
    this.show = false;
  };

  private handleShowErrors = () => {
    this.showErrors = true;
  };

  render() {
    return (
      <Host>
        {this.show && (
          <ap-modal onClose={this.handleClose}>
            <div class="error-modal">
              <ap-icon icon="dizzy" />
              <span class="main">{this.msgs.main}</span>
              <button class="slim" onClick={this.handleClose}>
                {this.msgs.close}
              </button>
              {!this.showErrors && (
                <button class="anchor show-errors" onClick={this.handleShowErrors}>
                  {this.msgs.showErrors}
                </button>
              )}
              {this.showErrors && <div class="errors">{this.errorDetail}</div>}
            </div>
          </ap-modal>
        )}
      </Host>
    );
  }
}
