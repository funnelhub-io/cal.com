import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import handleCancelBooking from "@calcom/features/bookings/lib/handleCancelBooking";
import { schemaBookingCancelParams } from "@calcom/prisma/zod-utils";

const schemaQueryIdParseInt = z.object({
  id: z.coerce.number(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { id, allRemainingBookings, cancellationReason } = schemaQueryIdParseInt
    .merge(schemaBookingCancelParams.pick({ allRemainingBookings: true, cancellationReason: true }))
    .parse({
      ...req.query,
      allRemainingBookings: req.query.allRemainingBookings === "true",
    });

  req.body = { id, allRemainingBookings, cancellationReason };

  const cancelled = await handleCancelBooking(req);

  res.status(req.statusCode ?? 200).json(cancelled);
  return;
}
