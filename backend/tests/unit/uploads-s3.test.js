import { describe, expect, test, vi } from "vitest";
import { GetObjectCommand } from "@aws-sdk/client-s3";

import "../helpers/use-s3.js";
import { getUrl } from "../../src/services/storage.service.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

describe("S3 presigned URLs", () => {
  test("returns a mocked download URL", async () => {
    getSignedUrl.mockResolvedValue(
      "https://example.com/test-download",
    );

    const url = await getUrl(
      "test-file-key",
      "document.pdf",
      "application/pdf",
    );

    expect(url).toBe("https://example.com/test-download");
    expect(getSignedUrl).toHaveBeenCalledTimes(1);

    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { expiresIn: 3600 },
    );

    // Check the S3 command passed to the mocked AWS function.
    const command = getSignedUrl.mock.calls[0][1];

    expect(command).toBeInstanceOf(GetObjectCommand);
    expect(command.input).toMatchObject({
      Bucket: "dropbox-test-bucket",
      Key: "test-file-key",
    });
  });
});