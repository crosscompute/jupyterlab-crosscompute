import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITranslator } from '@jupyterlab/translation';

import {
  COMMAND_PALETTE_CATEGORY,
  MAIN_PANEL_ID,
  START_DEPLOY_COMMAND,
  START_LAUNCH_COMMAND,
  START_RENDER_COMMAND,
  STOP_DEPLOY_COMMAND,
  STOP_LAUNCH_COMMAND,
  STOP_RENDER_COMMAND
} from './constant';
import { requestAPI } from './handler';
import { MainPanel } from './panel';

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
        requestAPI<any>('get_example')
          .then(data => {
            console.log(data);
          })
          .catch(reason => {
            console.error(reason);
          });
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

    if (palette) {
      palette.addItem({
        command: START_LAUNCH_COMMAND,
        category: COMMAND_PALETTE_CATEGORY
      });
      palette.addItem({
        command: STOP_LAUNCH_COMMAND,
        category: COMMAND_PALETTE_CATEGORY
      });
      palette.addItem({
        command: START_RENDER_COMMAND,
        category: COMMAND_PALETTE_CATEGORY
      });
      palette.addItem({
        command: STOP_RENDER_COMMAND,
        category: COMMAND_PALETTE_CATEGORY
      });
      palette.addItem({
        command: START_DEPLOY_COMMAND,
        category: COMMAND_PALETTE_CATEGORY
      });
      palette.addItem({
        command: STOP_DEPLOY_COMMAND,
        category: COMMAND_PALETTE_CATEGORY
      });
    }

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          // console.log(settings.composite);
        })
        .catch(reason => {
          // console.error(reason);
        });
    }

    if (restorer) {
      restorer.add(mainPanel, MAIN_PANEL_ID);
    }
  }
};

export default plugin;
