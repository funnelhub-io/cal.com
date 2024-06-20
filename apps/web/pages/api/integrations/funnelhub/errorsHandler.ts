import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";

import { HttpError } from "@calcom/lib/http-error";

export const errorsHandler = (error: unknown, req: NextApiRequest, res: NextApiResponse) => {
  const baseError = {
    method: req.method,
    url: req.url,
  };

  if (error instanceof HttpError) {
    const { statusCode, message, name, cause } = error;
    const errorObj = {
      statusCode,
      message,
      error: name,
      cause,
    };

    if (baseError.method === "POST" && message === "EventType 'null' cannot be booked at this time.") {
      res.status(statusCode).json({
        ...baseError,
        ...errorObj,
        cause: "Event type ID or the start time is invalid",
      });
      return;
    }

    res.status(statusCode).json({
      ...baseError,
      ...errorObj,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      ...baseError,
      errors: error.errors,
    });
    return;
  }

  if (error instanceof Error) {
    const { message } = error;

    if (baseError.method === "POST" && message === "no_available_users_found_error") {
      res.status(400).json({
        ...baseError,
        error: message,
        message: "No one is available to attend this event",
      });
      return;
    }

    res.status(400).json({
      ...baseError,
      error: message,
    });
    return;
  }

  res.status(500).json({
    ...baseError,
    error: "Internal Server Error",
  });
  return;
};
