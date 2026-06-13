import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// ── Mocks (vi.hoisted to avoid hoisting issues with vi.mock) ───────────────────

const { mockDeleteWhere, mockDelete, mockUpdateWhere, mockUpdateSet, mockUpdate } = vi.hoisted(() => {
  const mockDeleteWhere = vi.fn();
  const mockDelete = vi.fn().mockReturnValue({ where: mockDeleteWhere });
  const mockUpdateWhere = vi.fn();
  const mockUpdateSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
  const mockUpdate = vi.fn().mockReturnValue({ set: mockUpdateSet });
  return { mockDeleteWhere, mockDelete, mockUpdateWhere, mockUpdateSet, mockUpdate };
});

vi.mock("../../db", () => ({
  db: {
    delete: mockDelete,
    update: mockUpdate,
  },
}));

const { mockCacheDel, mockCacheFlushPattern } = vi.hoisted(() => ({
  mockCacheDel: vi.fn(),
  mockCacheFlushPattern: vi.fn(),
}));

vi.mock("../../lib/cache", () => ({
  cacheDel: mockCacheDel,
  cacheFlushPattern: mockCacheFlushPattern,
}));

const { mockRouteParam } = vi.hoisted(() => ({
  mockRouteParam: vi.fn(),
}));

vi.mock("../../lib/routeParams", () => ({
  routeParam: mockRouteParam,
}));

// ── SUT ───────────────────────────────────────────────────────────────────────

import { deleteQuestion, bulkDeleteQuestions } from "../../controllers/admin/questionsController";

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockReq(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    params: {},
    body: {},
    query: {},
    ...overrides,
  } as Partial<Request>;
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// ── Tests: deleteQuestion ─────────────────────────────────────────────────────

describe("deleteQuestion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteWhere.mockResolvedValue(undefined);
    mockUpdateWhere.mockResolvedValue(undefined);
    mockRouteParam.mockReturnValue("550e8400-e29b-41d4-a716-446655440001");
  });

  it("should delete a single question and clean up orphaned references", async () => {
    const req = mockReq({ params: { id: "550e8400-e29b-41d4-a716-446655440001" } }) as Request;
    const res = mockRes() as Response;
    const next = vi.fn() as NextFunction;

    await deleteQuestion(req, res, next);

    // Should delete from questions table
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDeleteWhere).toHaveBeenCalled();

    // Should clean up orphaned references in exam_sets, mock_tests, daily_quizzes
    // mockUpdate is called once per table (3 calls)
    expect(mockUpdate).toHaveBeenCalledTimes(3);

    // Should invalidate caches
    expect(mockCacheDel).toHaveBeenCalledWith("admin:dashboard:stats");
    expect(mockCacheDel).toHaveBeenCalledWith("admin:analytics:overview");
    expect(mockCacheFlushPattern).toHaveBeenCalledWith("ncert-mcq:");

    // Should respond with success
    expect(res.json).toHaveBeenCalledWith({ success: true });
    expect(next).not.toHaveBeenCalled();
  });

  it("should still respond success even if cleanup fails", async () => {
    mockUpdateWhere.mockRejectedValueOnce(new Error("DB error"));

    const req = mockReq({ params: { id: "550e8400-e29b-41d4-a716-446655440001" } }) as Request;
    const res = mockRes() as Response;
    const next = vi.fn() as NextFunction;

    await deleteQuestion(req, res, next);

    // Question was deleted
    expect(mockDelete).toHaveBeenCalledTimes(1);

    // Cleanup was attempted (even though it failed)
    expect(mockUpdate).toHaveBeenCalled();

    // Response still succeeds
    expect(res.json).toHaveBeenCalledWith({ success: true });
    expect(next).not.toHaveBeenCalled();
  });

  it("should pass errors to next() when deletion fails", async () => {
    const dbError = new Error("DB connection lost");
    mockDeleteWhere.mockRejectedValueOnce(dbError);

    const req = mockReq({ params: { id: "550e8400-e29b-41d4-a716-446655440001" } }) as Request;
    const res = mockRes() as Response;
    const next = vi.fn() as NextFunction;

    await deleteQuestion(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.json).not.toHaveBeenCalled();
  });
});

// ── Tests: bulkDeleteQuestions ────────────────────────────────────────────────

describe("bulkDeleteQuestions", () => {
  const ids = [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteWhere.mockResolvedValue(undefined);
    mockUpdateWhere.mockResolvedValue(undefined);
  });

  it("should bulk delete questions and clean up orphaned references", async () => {
    const req = mockReq({ body: { ids } }) as Request;
    const res = mockRes() as Response;
    const next = vi.fn() as NextFunction;

    await bulkDeleteQuestions(req, res, next);

    // Should delete from questions table
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDeleteWhere).toHaveBeenCalled();

    // Should clean up orphaned references in all 3 tables
    expect(mockUpdate).toHaveBeenCalledTimes(3);

    // Should invalidate caches
    expect(mockCacheDel).toHaveBeenCalledWith("admin:dashboard:stats");
    expect(mockCacheDel).toHaveBeenCalledWith("admin:analytics:overview");

    // Should respond with success and count
    expect(res.json).toHaveBeenCalledWith({ success: true, deletedCount: 2 });
    expect(next).not.toHaveBeenCalled();
  });

  it("should pass validation error to next() when ids is empty", async () => {
    const req = mockReq({ body: { ids: [] } }) as Request;
    const res = mockRes() as Response;
    const next = vi.fn() as NextFunction;

    await bulkDeleteQuestions(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 }),
    );
    expect(res.json).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("should pass validation error to next() when ids is not an array", async () => {
    const req = mockReq({ body: { ids: "not-an-array" } }) as Request;
    const res = mockRes() as Response;
    const next = vi.fn() as NextFunction;

    await bulkDeleteQuestions(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 }),
    );
    expect(res.json).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("should pass validation error to next() when ids is missing from body", async () => {
    const req = mockReq({ body: {} }) as Request;
    const res = mockRes() as Response;
    const next = vi.fn() as NextFunction;

    await bulkDeleteQuestions(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 }),
    );
  });

  it("should still respond success even if cleanup fails", async () => {
    mockUpdateWhere.mockRejectedValueOnce(new Error("DB error"));

    const req = mockReq({ body: { ids } }) as Request;
    const res = mockRes() as Response;
    const next = vi.fn() as NextFunction;

    await bulkDeleteQuestions(req, res, next);

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true, deletedCount: 2 });
    expect(next).not.toHaveBeenCalled();
  });

  it("should pass errors to next() when bulk deletion fails", async () => {
    const dbError = new Error("DB connection lost");
    mockDeleteWhere.mockRejectedValueOnce(dbError);

    const req = mockReq({ body: { ids } }) as Request;
    const res = mockRes() as Response;
    const next = vi.fn() as NextFunction;

    await bulkDeleteQuestions(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should handle a single id in the array", async () => {
    const req = mockReq({ body: { ids: ["550e8400-e29b-41d4-a716-446655440001"] } }) as Request;
    const res = mockRes() as Response;
    const next = vi.fn() as NextFunction;

    await bulkDeleteQuestions(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ success: true, deletedCount: 1 });
    expect(next).not.toHaveBeenCalled();
  });
});
