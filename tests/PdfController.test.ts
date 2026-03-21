// Mock uuid before any imports that use it
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-123')
}));

// Mock the mapper so tests focus on controller behavior only
jest.mock('../src/mapper/PDFDocument.Mapper', () => ({
  JSONMapper: class {
    map() {
      return {};
    }
    reversemap(pdf: any) {
      return {
        id: pdf.getId?.() ?? 'id1',
        summary: pdf.getSummary?.() ?? 'summary',
      };
    }
  }
}));

import { PdfController } from "../src/controller/PdfController";
import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";

// Helper to create a mock PDF document with all required methods
const createMockPDF = (overrides: Partial<any> = {}) => {
  const defaultValues = {
    id: 'id1',
    userId: 'user1',
    filename: 'file.pdf',
    size: 10,
    path: 'uploads/file.pdf',
    mimeType: 'application/pdf',
    extractedText: 'text',
    summary: 'summary',
  };
  const data = { ...defaultValues, ...overrides };

  return {
    // Properties (if needed)
    ...data,
    // Methods required by the mapper/controller
    getId: jest.fn().mockReturnValue(data.id),
    getUserId: jest.fn().mockReturnValue(data.userId),
    getFilename: jest.fn().mockReturnValue(data.filename),
    getFileSize: jest.fn().mockReturnValue(data.size),      // <-- added
    getPath: jest.fn().mockReturnValue(data.path),
    getMimeType: jest.fn().mockReturnValue(data.mimeType),
    getExtractedText: jest.fn().mockReturnValue(data.extractedText),
    getSummary: jest.fn().mockReturnValue(data.summary),
  };
};

describe("PdfController", () => {
  let pdfService: any;
  let controller: PdfController;
  let req: any;
  let res: any;

  beforeEach(() => {
    pdfService = {
      uploadPdf: jest.fn(),
      getPdfById: jest.fn(),
      getUserPdfs: jest.fn(),
    };

    controller = new PdfController(pdfService);

    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when no file is uploaded", async () => {
    req = { file: undefined, user: { userId: "user1" } };

    await controller.uploadPdf(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "No PDF file uploaded" });
  });

  it("uploads PDF and returns summary response", async () => {
    const mockPdf = createMockPDF();

    req = {
      file: {
        originalname: "file.pdf",
        buffer: Buffer.from(""),
        size: 10,
        mimetype: "application/pdf",
      },
      user: { userId: "user1" },
    };

    pdfService.uploadPdf.mockResolvedValue(mockPdf);

    await controller.uploadPdf(req, res);

    expect(pdfService.uploadPdf).toHaveBeenCalledWith("user1", req.file);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "PDF uploaded and summary generated",
        pdf: expect.objectContaining({ id: "id1", summary: "summary" }),
      })
    );
  });

  it("returns 404 when PDF not found", async () => {
    req = { params: { id: "id1" } };
    pdfService.getPdfById.mockResolvedValue(null);

    await controller.getPdfSummary(req, res);

    expect(pdfService.getPdfById).toHaveBeenCalledWith("id1");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "PDF not found" });
  });

  it("returns PDF summary when found", async () => {
    req = { params: { id: "id1" } };
    const mockPdf = createMockPDF();
    pdfService.getPdfById.mockResolvedValue(mockPdf);

    await controller.getPdfSummary(req, res);

    expect(res.json).toHaveBeenCalledWith({ summary: "summary" });
  });

  it("returns user PDFs list", async () => {
    req = { user: { id: "user1" } };
    const mockPdf = createMockPDF();
    pdfService.getUserPdfs.mockResolvedValue([mockPdf]);

    await controller.getUserPdfs(req, res);

    expect(pdfService.getUserPdfs).toHaveBeenCalledWith("user1");
    expect(res.json).toHaveBeenCalledWith({ pdfs: [expect.objectContaining({ id: "id1" })] });
  });

  it("handles service errors with 500 for uploadPdf", async () => {
    req = { file: {}, user: { userId: "user1" } };
    pdfService.uploadPdf.mockRejectedValue(new Error("service-error"));

    await controller.uploadPdf(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "service-error" });
  });
});