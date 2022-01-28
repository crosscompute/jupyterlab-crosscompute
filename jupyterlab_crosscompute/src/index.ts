import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { LabIcon, Switch } from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';
import { PanelLayout, Widget } from '@lumino/widgets';

import logoSvgstr from '../style/icons/Logo-SmallFormat-20220127.svg';
import { requestAPI } from './handler';

const NAME = 'CrossCompute';
const NAMESPACE = 'crosscompute';
const MAIN_PANEL_ID = NAMESPACE + '-main-panel';
const MAIN_PANEL_CLASSNAME = NAMESPACE + '-MainPanel';
const MAIN_PANEL_CAPTION = NAME;
const LAUNCH_COMMAND = NAMESPACE + ':launch';
const START_LAUNCH_COMMAND = LAUNCH_COMMAND + ':start';
const STOP_LAUNCH_COMMAND = LAUNCH_COMMAND + ':stop';
const RENDER_COMMAND = NAMESPACE + ':render';
const START_RENDER_COMMAND = RENDER_COMMAND + ':start';
const STOP_RENDER_COMMAND = RENDER_COMMAND + ':stop';
const DEPLOY_COMMAND = NAMESPACE + ':deploy';
const START_DEPLOY_COMMAND = DEPLOY_COMMAND + ':start';
const STOP_DEPLOY_COMMAND = DEPLOY_COMMAND + ':stop';
// const COMMAND_PALETTE_CATEGORY = 'CrossCompute';

const logoIcon = new LabIcon({
  name: NAMESPACE + ':logo',
  svgstr: logoSvgstr
});

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-crosscompute:plugin',
  autoStart: true,
  requires: [ITranslator],
  optional: [ICommandPalette, ISettingRegistry, ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    translator: ITranslator,
    palette: ICommandPalette | null,
    settingRegistry: ISettingRegistry | null,
    restorer: ILayoutRestorer | null
  ) => {
    const { commands, shell } = app;
    const trans = translator.load('jupyterlab');

    commands.addCommand(START_LAUNCH_COMMAND, {
      label: trans.__('Start Launch Automation'),
      execute: (args: any) => {
        console.log(START_LAUNCH_COMMAND);
      }
    });
    commands.addCommand(STOP_LAUNCH_COMMAND, {
      label: trans.__('Stop Launch Automation'),
      execute: (args: any) => {
        console.log(STOP_LAUNCH_COMMAND);
      }
    });
    commands.addCommand(START_RENDER_COMMAND, {
      label: trans.__('Start Render Automation'),
      execute: (args: any) => {
        console.log(START_RENDER_COMMAND);
      }
    });
    commands.addCommand(STOP_RENDER_COMMAND, {
      label: trans.__('Stop Render Automation'),
      execute: (args: any) => {
        console.log(STOP_RENDER_COMMAND);
      }
    });
    commands.addCommand(START_DEPLOY_COMMAND, {
      label: trans.__('Start Deploy Automation'),
      execute: (args: any) => {
        console.log(START_DEPLOY_COMMAND);
      }
    });
    commands.addCommand(STOP_DEPLOY_COMMAND, {
      label: trans.__('Stop Deploy Automation'),
      execute: (args: any) => {
        console.log(STOP_DEPLOY_COMMAND);
      }
    });

    const mainPanel = new MainPanel({ commands, translator });
    shell.add(mainPanel, 'right', { rank: 1000 });

    /*
    if (palette) {
      palette.addItem({
        command: LAUNCH_COMMAND,
        category: COMMAND_PALETTE_CATEGORY
      });

      palette.addItem({
        command: RENDER_COMMAND,
        category: COMMAND_PALETTE_CATEGORY
      });

      palette.addItem({
        command: DEPLOY_COMMAND,
        category: COMMAND_PALETTE_CATEGORY
      });
    }
    */

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log(settings.composite);
        })
        .catch(reason => {
          console.error(reason);
        });
    }

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(reason);
      });

    if (restorer) {
      restorer.add(mainPanel, MAIN_PANEL_ID);
    }
  }
};

class MainPanel extends Widget {
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
        args.newValue ? START_LAUNCH_COMMAND: STOP_LAUNCH_COMMAND);
    });
    automationRenderSwitch.valueChanged.connect((_, args) => {
      commands.execute(
        args.newValue ? START_RENDER_COMMAND : STOP_RENDER_COMMAND);
    });
    automationDeploySwitch.valueChanged.connect((_, args) => {
      commands.execute(
        args.newValue ? START_DEPLOY_COMMAND : STOP_DEPLOY_COMMAND);
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

export default plugin;
