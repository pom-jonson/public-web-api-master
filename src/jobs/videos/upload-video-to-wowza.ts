import uploadVideoToWowza from '../../use-cases/clips/upload-video-to-wowza';
import listEntries from '../../adapters/storage/list-entries';
import { getObject } from '../../adapters/storage/get-object';
import Wowza from '../../adapters/wowza';

export interface UploadVideoToWowzaRequest {
  videoFilePath: string;
  assetFileName: string;
  wowzaAssetId: string;
  uploadUrl: string;
}

const WOWZA_API_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NTU3NzEwZS0yYzhlLTQ1MDgtOTEwOS1hZWMxNTEwODAxY2UiLCJqdGkiOiI1ZGI1OGZkYzBmYzJhODFlMTdjNzIyY2RhYTYyMzA3Njc1ODRhZGY2NjM5ODk2MWIwY2MwNGU4OWEzNmQxNzA3MmZlMWE0OGYzM2RkYWYwOCIsImlhdCI6MTY4MzcyMDk1MSwibmJmIjoxNjgzNzIwOTUxLCJleHAiOjIzMTQ4NzI5NTEsInN1YiI6Ik9VLTdhYThmZDM4LWQ0MDUtNDVhMS04YmJkLWYxNTg2MTNjODE0YSJ9.zV375kaUPC81lB5f2ExD5Xw6S2p2errZURI7O2krkueO3_LS9qadnbwmnWb2bXQ5vtUGc3vl7laDwIQEirZRJiT0KBLpCZACVQrigghn3090g_mpNc_cGwlMJfxzJiNxnTf-vhKR6DTIaq6opztBcLtgc_a2Qxi3fiKHaphuQ6DjKtDP0GMwzTyFfwfXN96R-uqtF9i6dNYL4DjJbBxwRUD-ep4TEaOl-8FOVNxEU_gZ6ph-YooK9w3H_Y2Ly3RkfvdneJC9h-y6s92Gcloq1CVWBHIH1Y-rUNxIhB_z5nMXA5VeiZFb0mT6BTpRT8aAmHXSboUpZhK5oJh00JyMpix4nROm9OjIfLZIt_mF7Ol3EbS8Pc6QS0TlHz6FW7ekJSG5DFNThFyQoKb3OPpsDZZYDnrWI2SiaRnk4kPjT2IwLOSq-r5G4xngMSIvfu0RIGOy0MMtfE4EXA61rL4bLnkXredRG7Vcd2SNMCSBr1SJw4XBXDqD2_miawK9j9j8gIivofjNkQkBQDaehdONJjn0aq4bwyMbo2plSM0-lhee8O-72mdUnaIeJkRR-087VH-QMyBS53fjU0k9hTvJu9czs00gAZ72pUDQ1SaSm8AmY4IMpxaLLoxTtQfN0-Mw9-JhC-hVt6VuY35B5HTnF6ygwq9cNBkB8TLRKpzbXWs';

const uploadVideoToWowzaJobCallback = async ({
  videoFilePath,
  assetFileName,
  wowzaAssetId,
  uploadUrl,
}: UploadVideoToWowzaRequest): Promise<unknown> => {
  console.log(
    `Started uploading video to Wowza - video file path: ${videoFilePath}, asset file name: ${assetFileName}`,
  );

  const wowza = new Wowza({
    apiToken: WOWZA_API_TOKEN,
  });

  await uploadVideoToWowza(
    {
      videoFilePath,
      assetFileName,
      wowzaAssetId,
      uploadUrl,
    },
    {
      listEntries,
      getObject,
      wowza,
    },
  );
  return {};
};

export default uploadVideoToWowzaJobCallback;
