import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import prisma from "@calcom/prisma";

const queryParamsSchema = z.object({
  username: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { username } = queryParamsSchema.parse(req.query);

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
    select: {
      id: true,
      teams: {
        select: {
          teamId: true,
        },
      },
    },
  });

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const eventTypes = await prisma.eventType.findMany({
    where: {
      OR: [
        {
          userId: user.id,
        },
        {
          ...(user.teams && user.teams.length
            ? {
                teamId: 27,
              }
            : {}),
        },
      ],
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!eventTypes.length) res.status(404).json({ message: "No event types were found" });

  res.status(200).json(eventTypes);
  return;
}
