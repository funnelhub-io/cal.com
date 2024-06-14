import type { NextApiRequest, NextApiResponse } from "next";

import getBookingDataSchemaForApi from "@calcom/features/bookings/lib/getBookingDataSchemaForApi";
import handleNewBooking from "@calcom/features/bookings/lib/handleNewBooking";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
  const booking = await handleNewBooking(req, getBookingDataSchemaForApi);

  res.status(req.statusCode ?? 201).json(booking);
  return;
}
