import { LabIcon } from '@jupyterlab/ui-components';
import logoSvgstr from '../style/icons/Logo-SmallFormat-20220127.svg';

export const START_LAUNCH_COMMAND = 'crosscompute:launch:start';
export const STOP_LAUNCH_COMMAND = 'crosscompute:launch:stop';
// export const START_RENDER_COMMAND = 'crosscompute:render:start';
// export const STOP_RENDER_COMMAND = 'crosscompute:render:stop';
// export const START_DEPLOY_COMMAND = 'crosscompute:deploy:start';
// export const STOP_DEPLOY_COMMAND = 'crosscompute:deploy:stop';

export const COMMAND_PALETTE_CATEGORY = 'CrossCompute';

export const logoIcon = new LabIcon({
  name: 'crosscompute:logo',
  svgstr: logoSvgstr
});
