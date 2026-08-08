import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isOutletId, type OutletId } from "@/lib/pms-types";

const outletId = z.custom<OutletId>(isOutletId, { message: "Unknown outlet" });

export const getHotelFolio = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({ unit: z.string().min(1).max(60), simulateFault: z.boolean().optional() })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { fetchFolio, BridgeUnavailableError } = await import("@/lib/pms.server");
    try {
      return { ok: true as const, folio: await fetchFolio(data.unit, data.simulateFault ?? false) };
    } catch (error) {
      if (error instanceof BridgeUnavailableError) {
        return { ok: false as const, message: error.message, breaker: error.snapshot };
      }
      throw error;
    }
  });

export const requestPriorityTable = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        outletId,
        date: z.string().min(1),
        time: z.string().min(1),
        party: z.number().int().min(1).max(40),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { bookPriority, BridgeUnavailableError } = await import("@/lib/pms.server");
    try {
      return { ok: true as const, reservation: await bookPriority(data) };
    } catch (error) {
      if (error instanceof BridgeUnavailableError) {
        return { ok: false as const, message: error.message, breaker: error.snapshot };
      }
      throw error;
    }
  });

export const requestInResidenceDelivery = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        outletId,
        unit: z.string().min(1).max(60),
        items: z.string().min(1).max(600),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { orderInResidence, BridgeUnavailableError } = await import("@/lib/pms.server");
    try {
      return { ok: true as const, delivery: await orderInResidence(data) };
    } catch (error) {
      if (error instanceof BridgeUnavailableError) {
        return { ok: false as const, message: error.message, breaker: error.snapshot };
      }
      return { ok: false as const, message: (error as Error).message, breaker: null };
    }
  });
