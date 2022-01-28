import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { LabIcon, Switch } from '@jupyterlab/ui-components';
import { PanelLayout, Widget } from '@lumino/widgets';

import logoSvgstr from '../style/icons/Logo-SmallFormat-20220127.svg';
import { requestAPI } from './handler';

const NAME = 'CrossCompute';
const NAMESPACE = 'crosscompute';
const MAIN_PANEL_ID = NAMESPACE + '-main-panel';
const MAIN_PANEL_CLASSNAME = NAMESPACE + '-MainPanel';
const MAIN_PANEL_CAPTION = NAME;
const LAUNCH_COMMAND = NAMESPACE + ':launch';
const RENDER_COMMAND = NAMESPACE + ':render';
const DEPLOY_COMMAND = NAMESPACE + ':deploy';
const COMMAND_PALETTE_CATEGORY = 'CrossCompute';

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

    commands.addCommand(LAUNCH_COMMAND, {
      label: trans.__('Launch Automation'),
      execute: (args: any) => {
        console.log(LAUNCH_COMMAND);
      }
    });
    commands.addCommand(RENDER_COMMAND, {
      label: trans.__('Render Automation'),
      execute: (args: any) => {
        console.log(RENDER_COMMAND);
      }
    });
    commands.addCommand(DEPLOY_COMMAND, {
      label: trans.__('Deploy Automation'),
      execute: (args: any) => {
        console.log(DEPLOY_COMMAND);
      }
    });

    const mainPanel = new MainPanel({ translator });
    shell.add(mainPanel, 'right', { rank: 1000 });

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

    const translator = options.translator || nullTranslator;
    const trans = translator.load('jupyterlab');

    const automationLaunchSwitch = new Switch();
    const automationRenderSwitch = new Switch();
    const automationDeploySwitch = new Switch();

    /*
    automationRenderSwitch.valueChanged.connect(_, args) => {
      console.log('Launch');
    });
    */

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
    translator: ITranslator;
  }
}

export default plugin;
