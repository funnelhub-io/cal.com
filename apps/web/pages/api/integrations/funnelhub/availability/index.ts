import { errorsHandler } from "@pages/api/integrations/funnelhub/errorsHandler";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { getUserAvailability } from "@calcom/core/getUserAvailability";

const queryParamsSchema = z.object({
  eventTypeId: z.coerce.number(),
  username: z.string(),
  dateFrom: z.string().refine((date) => {
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    return dateRegex.test(date) && date;
  }, "Date string must have the following format: yyyy-mm-dd"),
  dateTo: z.string().refine((date) => {
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    return dateRegex.test(date) && date;
  }, "Date string must have the following format: yyyy-mm-dd"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { dateFrom, dateTo, eventTypeId, username } = queryParamsSchema.parse(req.query);

  try {
    const availability = await getUserAvailability({
      dateFrom,
      dateTo,
      returnDateOverrides: false,
      username,
      eventTypeId,
    });

    res.status(200).json(availability);
    return;
  } catch (error) {
    return errorsHandler(error, req, res);
  }
}
