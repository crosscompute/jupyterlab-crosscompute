import { ReactWidget } from '@jupyterlab/apputils';

import React from 'react';

import { logoIcon } from './constant';

export class AutomationBody extends ReactWidget {
  constructor() {
    super();
    this.id = 'crosscompute-automation';
    this.addClass('crosscompute-Automation');

    const title = this.title;
    title.icon = logoIcon;
    title.caption = 'CrossCompute Automation';
  }

  render(): JSX.Element {
    return <div>Hey!</div>;
  }
}
