import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Lambda } from 'aws-sdk';
import executeAuthenticatedCallback from '../middleware/execute-callback';
import getProjectPath from '../../use-cases/projects/get-project-path';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import listEntries from '../../adapters/storage/list-entries';
import Wowza from '../../adapters/wowza';

export interface UploadVideoToWowzaParams {
  id: string;
  videoId: string;
}

export interface UploadVideoToWowzaPayload {
  fileName: string;
}

const WOWZA_API_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NTU3NzEwZS0yYzhlLTQ1MDgtOTEwOS1hZWMxNTEwODAxY2UiLCJqdGkiOiI1ZGI1OGZkYzBmYzJhODFlMTdjNzIyY2RhYTYyMzA3Njc1ODRhZGY2NjM5ODk2MWIwY2MwNGU4OWEzNmQxNzA3MmZlMWE0OGYzM2RkYWYwOCIsImlhdCI6MTY4MzcyMDk1MSwibmJmIjoxNjgzNzIwOTUxLCJleHAiOjIzMTQ4NzI5NTEsInN1YiI6Ik9VLTdhYThmZDM4LWQ0MDUtNDVhMS04YmJkLWYxNTg2MTNjODE0YSJ9.zV375kaUPC81lB5f2ExD5Xw6S2p2errZURI7O2krkueO3_LS9qadnbwmnWb2bXQ5vtUGc3vl7laDwIQEirZRJiT0KBLpCZACVQrigghn3090g_mpNc_cGwlMJfxzJiNxnTf-vhKR6DTIaq6opztBcLtgc_a2Qxi3fiKHaphuQ6DjKtDP0GMwzTyFfwfXN96R-uqtF9i6dNYL4DjJbBxwRUD-ep4TEaOl-8FOVNxEU_gZ6ph-YooK9w3H_Y2Ly3RkfvdneJC9h-y6s92Gcloq1CVWBHIH1Y-rUNxIhB_z5nMXA5VeiZFb0mT6BTpRT8aAmHXSboUpZhK5oJh00JyMpix4nROm9OjIfLZIt_mF7Ol3EbS8Pc6QS0TlHz6FW7ekJSG5DFNThFyQoKb3OPpsDZZYDnrWI2SiaRnk4kPjT2IwLOSq-r5G4xngMSIvfu0RIGOy0MMtfE4EXA61rL4bLnkXredRG7Vcd2SNMCSBr1SJw4XBXDqD2_miawK9j9j8gIivofjNkQkBQDaehdONJjn0aq4bwyMbo2plSM0-lhee8O-72mdUnaIeJkRR-087VH-QMyBS53fjU0k9hTvJu9czs00gAZ72pUDQ1SaSm8AmY4IMpxaLLoxTtQfN0-Mw9-JhC-hVt6VuY35B5HTnF6ygwq9cNBkB8TLRKpzbXWs';

const uploadVideoToWowzaCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(
    event,
    async (
      identity,
      { id, videoId }: UploadVideoToWowzaParams,
      { fileName }: UploadVideoToWowzaPayload,
    ) => {
      const projectPath = await getProjectPath(
        { customerEmail: identity.email, id },
        { bucket: GET_PROJECT_BUCKET(), listEntries },
      );

      const videoFolderPath = `${projectPath}/processed/${videoId}`;

      const lambda = new Lambda();
      const functionName = process.env.UPLOAD_VIDEO_TO_WOWZA_JOB_HANDLER_FUNCTION_NAME;

      const wowza = new Wowza({
        apiToken: WOWZA_API_TOKEN,
      });
      const {
        asset: { id: wowzaAssetId, upload_url: uploadUrl },
      } = await wowza.createAsset(fileName);
      const wowzaAssetUrl = `https://video.wowza.com/en/manage/assets/${wowzaAssetId}`;

      const response = await lambda
        .invoke({
          FunctionName: functionName,
          Payload: JSON.stringify({
            videoFilePath: videoFolderPath,
            assetFileName: fileName,
            wowzaAssetId,
            uploadUrl,
          }),
          InvocationType: 'Event',
        })
        .promise();

      return { body: { wowzaAssetUrl } };
    },
  );

export default uploadVideoToWowzaCallback;
