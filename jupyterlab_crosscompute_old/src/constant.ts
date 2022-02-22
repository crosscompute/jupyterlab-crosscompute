import { LabIcon } from '@jupyterlab/ui-components';
import logoSvgstr from '../style/icons/Logo-SmallFormat-20220127.svg';

export const logoIcon = new LabIcon({
  name: 'crosscompute:logo',
  svgstr: logoSvgstr
});

export namespace CommandIDs {
  export const launchStart = 'crosscompute:launch:start';
  export const launchStop = 'crosscompute:launch:stop';
  // export const renderStart = 'crosscompute:render:start';
  // export const renderStop = 'crosscompute:render:stop';
  // export const deployStart = 'crosscompute:deploy:start';
  // export const deployStop = 'crosscompute:deploy:stop';
}

export namespace ErrorCode {
  export const configurationNotFound = -100;
}

export const COMMAND_CATEGORY = 'CrossCompute';
