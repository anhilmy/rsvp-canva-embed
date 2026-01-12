import { Router, Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { RSVP, Guest, Website } from "../models";
import { apiKeyAuth } from "../middleware/auth";
import { rsvpLimiter } from "../middleware/rateLimit";
import { createError } from "../middleware/errorHandler";

const router = Router();

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(errors.array()[0].msg, 400));
  }
  next();
};

// POST /api/rsvp - Submit RSVP (Public, rate limited)
router.post(
  "/",
  rsvpLimiter,
  [
    body("guestId").isMongoId().withMessage("Valid guest ID is required"),
    body("status")
      .isIn(["attending", "not_attending", "maybe"])
      .withMessage("Status must be attending, not_attending, or maybe"),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guestId, status } = req.body;

      // Verify guest exists
      const guest = await Guest.findById(guestId);
      if (!guest) {
        return next(createError("Guest not found", 404));
      }

      // Check for existing RSVP
      const existingRsvp = await RSVP.findOne({ guestId });
      if (existingRsvp) {
        // Update existing RSVP
        existingRsvp.status = status;
        await existingRsvp.save();

        return res.json({
          success: true,
          data: existingRsvp,
          message: "RSVP updated successfully",
        });
      }

      // Create new RSVP
      const rsvp = new RSVP({
        guestId,
        websiteId: guest.websiteId,
        status,
      });
      await rsvp.save();

      res.status(201).json({
        success: true,
        data: rsvp,
        message: "RSVP submitted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/rsvp/website/:websiteId - Get all RSVPs for website (Admin only)
router.get(
  "/website/:websiteId",
  apiKeyAuth,
  [param("websiteId").isMongoId().withMessage("Invalid website ID")],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rsvps = await RSVP.find({
        websiteId: req.params.websiteId,
      }).populate("guestId", "name email");

      res.json({
        success: true,
        data: rsvps,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/rsvp/website/:websiteId/status - Get RSVP summary (Public)
router.get(
  "/website/:websiteId/status",
  [param("websiteId").isMongoId().withMessage("Invalid website ID")],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const websiteId = req.params.websiteId;

      // Count guests and RSVPs
      const totalGuests = await Guest.countDocuments({ websiteId });
      const rsvpCounts = await RSVP.aggregate([
        { $match: { websiteId: require("mongoose").Types.ObjectId.createFromHexString(websiteId) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const statusMap: Record<string, number> = {
        attending: 0,
        not_attending: 0,
        maybe: 0,
      };

      rsvpCounts.forEach((r) => {
        statusMap[r._id] = r.count;
      });

      const responded =
        statusMap.attending + statusMap.not_attending + statusMap.maybe;

      res.json({
        success: true,
        data: {
          total: totalGuests,
          responded,
          pending: totalGuests - responded,
          attending: statusMap.attending,
          notAttending: statusMap.not_attending,
          maybe: statusMap.maybe,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/rsvp/guest/:guestId - Get RSVP for specific guest (Public)
router.get(
  "/guest/:guestId",
  [param("guestId").isMongoId().withMessage("Invalid guest ID")],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rsvp = await RSVP.findOne({ guestId: req.params.guestId });

      if (!rsvp) {
        return res.json({
          success: true,
          data: null,
          message: "No RSVP found for this guest",
        });
      }

      res.json({
        success: true,
        data: rsvp,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
