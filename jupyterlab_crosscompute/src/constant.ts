import { LabIcon } from '@jupyterlab/ui-components';
import logoSvgstr from '../style/icons/Logo-SmallFormat-20220127.svg';

export const logoIcon = new LabIcon({
  name: 'crosscompute:logo',
  svgstr: logoSvgstr
});

export namespace ErrorCode {
  export const CONFIGURATION_NOT_FOUND = -100;
}

export const START_LAUNCH_COMMAND = 'crosscompute:launch:start';
export const STOP_LAUNCH_COMMAND = 'crosscompute:launch:stop';
// export const START_RENDER_COMMAND = 'crosscompute:render:start';
// export const STOP_RENDER_COMMAND = 'crosscompute:render:stop';
// export const START_DEPLOY_COMMAND = 'crosscompute:deploy:start';
// export const STOP_DEPLOY_COMMAND = 'crosscompute:deploy:stop';

export const COMMAND_CATEGORY = 'CrossCompute';
