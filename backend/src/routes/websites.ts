import { Router, Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { Website } from "../models";
import { apiKeyAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";

const router = Router();

// Validation middleware
const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(createError(errors.array()[0].msg, 400));
    }
    next();
};

// POST /api/websites - Register a new website (Admin only)
router.post(
    "/",
    apiKeyAuth,
    [
        body("canvaDesignId")
            .notEmpty()
            .withMessage("Canva design ID is required"),
        body("name").notEmpty().withMessage("Website name is required"),
    ],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { canvaDesignId, name } = req.body;

            // Check if website already exists
            const existing = await Website.findOne({ canvaDesignId });
            if (existing) {
                return res.json({
                    success: true,
                    data: existing,
                    message: "Website already registered",
                });
            }

            const website = new Website({ canvaDesignId, name });
            await website.save();

            res.status(201).json({
                success: true,
                data: website,
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/websites/:id - Get website details (Admin only)
router.get(
    "/:id",
    apiKeyAuth,
    [param("id").isMongoId().withMessage("Invalid website ID")],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const website = await Website.findById(req.params.id);
            if (!website) {
                return next(createError("Website not found", 404));
            }

            res.json({
                success: true,
                data: website,
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/websites/:id/validate - Check if website exists (Public)
router.get(
    "/:id/validate",
    [param("id").isMongoId().withMessage("Invalid website ID")],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const website = await Website.findById(req.params.id).select(
                "name canvaDesignId"
            );
            if (!website) {
                return next(createError("Website not found", 404));
            }

            res.json({
                success: true,
                data: {
                    id: website._id,
                    name: website.name,
                    exists: true,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/websites/by-design/:designId - Get by Canva design ID (Public)
router.get("/by-design/:designId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const website = await Website.findOne({
            canvaDesignId: req.params.designId,
        }).select("_id name");

        if (!website) {
            return next(createError("Website not found", 404));
        }

        res.json({
            success: true,
            data: {
                id: website._id,
                name: website.name,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
