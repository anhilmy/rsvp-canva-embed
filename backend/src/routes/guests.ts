import { Router, Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { Guest, Website, RSVP } from "../models";
import { apiKeyAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";

const router = Router();

const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(createError(errors.array()[0].msg, 400));
    }
    next();
};

// POST /api/guests/validate - Validate guest by invite code (Public)
router.post(
    "/validate",
    [
        body("inviteCode").notEmpty().withMessage("Invite code is required"),
        body("websiteId").isMongoId().withMessage("Valid website ID is required"),
    ],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { inviteCode, websiteId } = req.body;

            const guest = await Guest.findOne({
                inviteCode: inviteCode.toUpperCase(),
                websiteId,
            });

            if (!guest) {
                return next(createError("Invalid invite code", 404));
            }

            // Check if already RSVP'd
            const existingRsvp = await RSVP.findOne({ guestId: guest._id });

            res.json({
                success: true,
                data: {
                    id: guest._id,
                    name: guest.name,
                    hasRsvp: !!existingRsvp,
                    rsvpStatus: existingRsvp?.status || null,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/guests - Add guest(s) to website (Admin only)
router.post(
    "/",
    apiKeyAuth,
    [
        body("websiteId").isMongoId().withMessage("Valid website ID is required"),
        body("guests").isArray({ min: 1 }).withMessage("Guests array is required"),
        body("guests.*.name").notEmpty().withMessage("Guest name is required"),
    ],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { websiteId, guests } = req.body;

            // Verify website exists
            const website = await Website.findById(websiteId);
            if (!website) {
                return next(createError("Website not found", 404));
            }

            const createdGuests = await Guest.insertMany(
                guests.map((g: any) => ({
                    websiteId,
                    name: g.name,
                    email: g.email,
                    phone: g.phone,
                }))
            );

            res.status(201).json({
                success: true,
                data: createdGuests,
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/guests/website/:websiteId - List all guests for website (Admin only)
router.get(
    "/website/:websiteId",
    apiKeyAuth,
    [param("websiteId").isMongoId().withMessage("Invalid website ID")],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guests = await Guest.find({ websiteId: req.params.websiteId });

            // Get RSVP status for each guest
            const guestIds = guests.map((g) => g._id);
            const rsvps = await RSVP.find({ guestId: { $in: guestIds } });
            const rsvpMap = new Map(
                rsvps.map((r) => [r.guestId.toString(), r.status])
            );

            const guestsWithRsvp = guests.map((g) => ({
                id: g._id,
                name: g.name,
                email: g.email,
                phone: g.phone,
                inviteCode: g.inviteCode,
                rsvpStatus: rsvpMap.get(g._id.toString()) || "pending",
                createdAt: g.createdAt,
            }));

            res.json({
                success: true,
                data: guestsWithRsvp,
            });
        } catch (error) {
            next(error);
        }
    }
);

// PUT /api/guests/:id - Update guest (Admin only)
router.put(
    "/:id",
    apiKeyAuth,
    [
        param("id").isMongoId().withMessage("Invalid guest ID"),
        body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    ],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, phone } = req.body;

            const guest = await Guest.findByIdAndUpdate(
                req.params.id,
                { name, email, phone },
                { new: true }
            );

            if (!guest) {
                return next(createError("Guest not found", 404));
            }

            res.json({
                success: true,
                data: guest,
            });
        } catch (error) {
            next(error);
        }
    }
);

// DELETE /api/guests/:id - Remove guest (Admin only)
router.delete(
    "/:id",
    apiKeyAuth,
    [param("id").isMongoId().withMessage("Invalid guest ID")],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guest = await Guest.findByIdAndDelete(req.params.id);
            if (!guest) {
                return next(createError("Guest not found", 404));
            }

            // Also delete associated RSVP
            await RSVP.deleteOne({ guestId: guest._id });

            res.json({
                success: true,
                message: "Guest deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
