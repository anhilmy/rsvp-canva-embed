import { Router, Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { Wish, Guest, Website } from "../models";
import { apiKeyAuth } from "../middleware/auth";
import { wishLimiter } from "../middleware/rateLimit";
import { createError } from "../middleware/errorHandler";

const router = Router();

const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(createError(errors.array()[0].msg, 400));
    }
    next();
};

// POST /api/wishes - Submit a wish (Public, rate limited)
router.post(
    "/",
    wishLimiter,
    [
        body("guestId").isMongoId().withMessage("Valid guest ID is required"),
        body("message")
            .notEmpty()
            .withMessage("Message is required")
            .isLength({ max: 1000 })
            .withMessage("Message must be 1000 characters or less"),
    ],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { guestId, message } = req.body;

            // Verify guest exists
            const guest = await Guest.findById(guestId);
            if (!guest) {
                return next(createError("Guest not found", 404));
            }

            const wish = new Wish({
                guestId,
                websiteId: guest.websiteId,
                guestName: guest.name,
                message,
            });
            await wish.save();

            res.status(201).json({
                success: true,
                data: wish,
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/wishes/website/:websiteId - Get public wishes for website (Public)
router.get(
    "/website/:websiteId",
    [param("websiteId").isMongoId().withMessage("Invalid website ID")],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const wishes = await Wish.find({
                websiteId: req.params.websiteId,
                isPublic: true,
                isHidden: false,
            })
                .sort({ createdAt: -1 })
                .select("guestName message createdAt");

            res.json({
                success: true,
                data: wishes,
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/wishes/website/:websiteId/all - Get all wishes (Admin only)
router.get(
    "/website/:websiteId/all",
    apiKeyAuth,
    [param("websiteId").isMongoId().withMessage("Invalid website ID")],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const wishes = await Wish.find({
                websiteId: req.params.websiteId,
            })
                .sort({ createdAt: -1 })
                .populate("guestId", "name email");

            res.json({
                success: true,
                data: wishes,
            });
        } catch (error) {
            next(error);
        }
    }
);

// PUT /api/wishes/:id/report - Report a wish (Public)
router.put(
    "/:id/report",
    [param("id").isMongoId().withMessage("Invalid wish ID")],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const wish = await Wish.findByIdAndUpdate(
                req.params.id,
                { isReported: true },
                { new: true }
            );

            if (!wish) {
                return next(createError("Wish not found", 404));
            }

            res.json({
                success: true,
                message: "Wish reported successfully",
            });
        } catch (error) {
            next(error);
        }
    }
);

// PUT /api/wishes/:id/hide - Hide a wish (Admin only)
router.put(
    "/:id/hide",
    apiKeyAuth,
    [param("id").isMongoId().withMessage("Invalid wish ID")],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const wish = await Wish.findByIdAndUpdate(
                req.params.id,
                { isHidden: true },
                { new: true }
            );

            if (!wish) {
                return next(createError("Wish not found", 404));
            }

            res.json({
                success: true,
                message: "Wish hidden successfully",
            });
        } catch (error) {
            next(error);
        }
    }
);

// PUT /api/wishes/:id/unhide - Unhide a wish (Admin only)
router.put(
    "/:id/unhide",
    apiKeyAuth,
    [param("id").isMongoId().withMessage("Invalid wish ID")],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const wish = await Wish.findByIdAndUpdate(
                req.params.id,
                { isHidden: false },
                { new: true }
            );

            if (!wish) {
                return next(createError("Wish not found", 404));
            }

            res.json({
                success: true,
                message: "Wish unhidden successfully",
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
