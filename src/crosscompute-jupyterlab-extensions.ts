import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { BASE_PATH } from './constants';

export async function requestAPI<T>(
  relativePath = '',
  requestAttributes: RequestInit = {}
): Promise<T> {
  const settings = ServerConnection.makeSettings();
  const requestUrl = URLExt.join(settings.baseUrl, BASE_PATH, relativePath);
  let response: Response;
  try {
    response = await ServerConnection.makeRequest(
      requestUrl,
      requestAttributes,
      settings
    );
  } catch (error) {
    throw new ServerConnection.NetworkError(error);
  }
  let data: any = await response.text();
  if (data.length > 0) {
    try {
      data = JSON.parse(data);
    } catch (error) {
      console.log('could not parse json', response);
    }
  }
  if (!response.ok) {
    throw new ServerConnection.ResponseError(response, data.message || data);
  }
  return data;
}
