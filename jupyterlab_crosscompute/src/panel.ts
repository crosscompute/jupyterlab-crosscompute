import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { Switch } from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';
import { PanelLayout, Widget } from '@lumino/widgets';

import {
  logoIcon,
  MAIN_PANEL_CAPTION,
  MAIN_PANEL_CLASSNAME,
  MAIN_PANEL_ID,
  START_DEPLOY_COMMAND,
  START_LAUNCH_COMMAND,
  START_RENDER_COMMAND,
  STOP_DEPLOY_COMMAND,
  STOP_LAUNCH_COMMAND,
  STOP_RENDER_COMMAND
} from './constant';

export class MainPanel extends Widget {
  constructor(options: MainPanel.IOptions) {
    super();
    this.id = MAIN_PANEL_ID;
    this.addClass(MAIN_PANEL_CLASSNAME);

    const title = this.title;
    title.icon = logoIcon;
    title.caption = MAIN_PANEL_CAPTION;

    const { commands } = options;
    const translator = options.translator || nullTranslator;
    const trans = translator.load('jupyterlab');

    const automationLaunchSwitch = new Switch();
    const automationRenderSwitch = new Switch();
    const automationDeploySwitch = new Switch();
    automationLaunchSwitch.valueChanged.connect((_, args) => {
      commands.execute(
        args.newValue ? START_LAUNCH_COMMAND : STOP_LAUNCH_COMMAND
      );
    });
    automationRenderSwitch.valueChanged.connect((_, args) => {
      commands.execute(
        args.newValue ? START_RENDER_COMMAND : STOP_RENDER_COMMAND
      );
    });
    automationDeploySwitch.valueChanged.connect((_, args) => {
      commands.execute(
        args.newValue ? START_DEPLOY_COMMAND : STOP_DEPLOY_COMMAND
      );
    });
    automationLaunchSwitch.label = trans.__('Launch');
    automationRenderSwitch.label = trans.__('Render');
    automationDeploySwitch.label = trans.__('Deploy');

    const layout = new PanelLayout();
    layout.addWidget(automationLaunchSwitch);
    layout.addWidget(automationRenderSwitch);
    layout.addWidget(automationDeploySwitch);
    this.layout = layout;
  }
}

namespace MainPanel {
  export interface IOptions {
    commands: CommandRegistry;
    translator: ITranslator;
  }
}
