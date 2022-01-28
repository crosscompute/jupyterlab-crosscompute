import { LabIcon } from '@jupyterlab/ui-components';
import logoSvgstr from '../style/icons/Logo-SmallFormat-20220127.svg';

export const NAME = 'CrossCompute';
export const NAMESPACE = NAME.toLowerCase();

export const MAIN_PANEL_ID = NAMESPACE + '-main-panel';
export const MAIN_PANEL_CLASSNAME = NAMESPACE + '-MainPanel';
export const MAIN_PANEL_CAPTION = NAME;

export const LAUNCH_COMMAND = NAMESPACE + ':launch';
export const START_LAUNCH_COMMAND = LAUNCH_COMMAND + ':start';
export const STOP_LAUNCH_COMMAND = LAUNCH_COMMAND + ':stop';
export const RENDER_COMMAND = NAMESPACE + ':render';
export const START_RENDER_COMMAND = RENDER_COMMAND + ':start';
export const STOP_RENDER_COMMAND = RENDER_COMMAND + ':stop';
export const DEPLOY_COMMAND = NAMESPACE + ':deploy';
export const START_DEPLOY_COMMAND = DEPLOY_COMMAND + ':start';
export const STOP_DEPLOY_COMMAND = DEPLOY_COMMAND + ':stop';

export const COMMAND_PALETTE_CATEGORY = 'CrossCompute';

export const logoIcon = new LabIcon({
  name: NAMESPACE + ':logo',
  svgstr: logoSvgstr
});
