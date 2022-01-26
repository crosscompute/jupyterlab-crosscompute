import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { requestAPI } from './handler';

/**
 * Initialization data for the jupyterlab-crosscompute extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-crosscompute:plugin',
  autoStart: true,
  optional: [ICommandPalette, ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette | null,
    settingRegistry: ISettingRegistry | null
  ) => {
    const { commands } = app;

    const LAUNCH_COMMAND = 'crosscompute:launch';
    const RENDER_COMMAND = 'crosscompute:render';
    const DEPLOY_COMMAND = 'crosscompute:deploy';

    commands.addCommand(LAUNCH_COMMAND, {
      label: 'Launch Automation',
      execute: (args: any) => {
        console.log(LAUNCH_COMMAND, args['origin']);
      },
    });
    commands.addCommand(RENDER_COMMAND, {
      label: 'Render Automation',
      execute: (args: any) => {
        console.log(RENDER_COMMAND, args['origin']);
      },
    });
    commands.addCommand(DEPLOY_COMMAND, {
      label: 'Deploy Automation',
      execute: (args: any) => {
        console.log(DEPLOY_COMMAND, args['origin']);
      },
    });

    commands.execute(LAUNCH_COMMAND, { origin: 'init' }).catch((reason) => {
      console.error('hey', reason);
    });

    if (palette) {
      const COMMAND_PALETTE_CATEGORY = 'CrossCompute';

      palette.addItem({
        command: LAUNCH_COMMAND,
        category: COMMAND_PALETTE_CATEGORY,
        args: { origin: 'from palette' },
      });

      palette.addItem({
        command: RENDER_COMMAND,
        category: COMMAND_PALETTE_CATEGORY,
        args: { origin: 'from palette' },
      });

      palette.addItem({
        command: DEPLOY_COMMAND,
        category: COMMAND_PALETTE_CATEGORY,
        args: { origin: 'from palette' },
      });
    }

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('jupyterlab-crosscompute settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for jupyterlab-crosscompute.', reason);
        });
    }

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jupyterlab_crosscompute server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
