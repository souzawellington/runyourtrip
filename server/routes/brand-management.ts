import { Express } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertBrandAssetSchema, insertBrandConfigurationSchema } from "@shared/schema";
import fs from "fs/promises";
import path from "path";
import { generalApiLimiter } from "../middleware/rate-limit";

// Validation schemas
const uploadBrandAssetsSchema = z.object({
  files: z.array(z.object({
    name: z.string(),
    type: z.string(),
    category: z.string(),
    path: z.string(),
    mimeType: z.string().optional(),
  }))
});

const applyBrandConfigurationSchema = z.object({
  configurationId: z.number(),
});

export default function brandManagementRoutes(app: Express) {
  // Get all brand assets
  app.get("/api/brand/assets", generalApiLimiter, async (req, res) => {
    try {
      const type = req.query.type as string;
      const category = req.query.category as string;
      
      let assets;
      if (type) {
        assets = await storage.getBrandAssetsByType(type);
      } else if (category) {
        assets = await storage.getBrandAssetsByCategory(category);
      } else {
        assets = await storage.getAllBrandAssets();
      }
      
      res.json(assets);
    } catch (error) {
      console.error("Error fetching brand assets:", error);
      res.status(500).json({ message: "Failed to fetch brand assets" });
    }
  });

  // Get single brand asset
  app.get("/api/brand/assets/:id", generalApiLimiter, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const asset = await storage.getBrandAssetById(id);
      
      if (!asset) {
        return res.status(404).json({ message: "Brand asset not found" });
      }
      
      res.json(asset);
    } catch (error) {
      console.error("Error fetching brand asset:", error);
      res.status(500).json({ message: "Failed to fetch brand asset" });
    }
  });

  // Create brand asset
  app.post("/api/brand/assets", generalApiLimiter, async (req, res) => {
    try {
      const validatedData = insertBrandAssetSchema.parse(req.body);
      const asset = await storage.createBrandAsset(validatedData);
      res.json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating brand asset:", error);
        res.status(500).json({ message: "Failed to create brand asset" });
      }
    }
  });

  // Update brand asset
  app.patch("/api/brand/assets/:id", generalApiLimiter, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const asset = await storage.updateBrandAsset(id, req.body);
      
      if (!asset) {
        return res.status(404).json({ message: "Brand asset not found" });
      }
      
      res.json(asset);
    } catch (error) {
      console.error("Error updating brand asset:", error);
      res.status(500).json({ message: "Failed to update brand asset" });
    }
  });

  // Delete brand asset
  app.delete("/api/brand/assets/:id", generalApiLimiter, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBrandAsset(id);
      
      if (!success) {
        return res.status(404).json({ message: "Brand asset not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting brand asset:", error);
      res.status(500).json({ message: "Failed to delete brand asset" });
    }
  });

  // Get all brand configurations
  app.get("/api/brand/configurations", generalApiLimiter, async (req, res) => {
    try {
      const configurations = await storage.getAllBrandConfigurations();
      res.json(configurations);
    } catch (error) {
      console.error("Error fetching brand configurations:", error);
      res.status(500).json({ message: "Failed to fetch brand configurations" });
    }
  });

  // Get active brand configuration
  app.get("/api/brand/configurations/active", generalApiLimiter, async (req, res) => {
    try {
      const configuration = await storage.getActiveBrandConfiguration();
      
      if (!configuration) {
        // Return default configuration if no active one exists
        const defaultConfig = await storage.getDefaultBrandConfiguration();
        return res.json(defaultConfig || null);
      }
      
      res.json(configuration);
    } catch (error) {
      console.error("Error fetching active brand configuration:", error);
      res.status(500).json({ message: "Failed to fetch active brand configuration" });
    }
  });

  // Create brand configuration
  app.post("/api/brand/configurations", generalApiLimiter, async (req, res) => {
    try {
      const validatedData = insertBrandConfigurationSchema.parse(req.body);
      const configuration = await storage.createBrandConfiguration(validatedData);
      res.json(configuration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating brand configuration:", error);
        res.status(500).json({ message: "Failed to create brand configuration" });
      }
    }
  });

  // Apply brand configuration
  app.post("/api/brand/configurations/apply", generalApiLimiter, async (req, res) => {
    try {
      const { configurationId } = applyBrandConfigurationSchema.parse(req.body);
      
      // Get the configuration to apply
      const configuration = await storage.getBrandConfigurationById(configurationId);
      if (!configuration) {
        return res.status(404).json({ message: "Brand configuration not found" });
      }
      
      // Set it as active
      await storage.setActiveBrandConfiguration(configurationId);
      
      // Create history entry
      const history = await storage.createBrandApplicationHistory({
        configurationId,
        appliedBy: "demo-user", // Use actual user ID from auth
        status: "active",
        changes: configuration.config,
      });
      
      res.json({ 
        success: true, 
        configuration,
        history 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error applying brand configuration:", error);
        res.status(500).json({ message: "Failed to apply brand configuration" });
      }
    }
  });

  // Upload and process brand assets from zip
  app.post("/api/brand/upload-assets", generalApiLimiter, async (req, res) => {
    try {
      const { files } = uploadBrandAssetsSchema.parse(req.body);
      const createdAssets = [];
      
      for (const file of files) {
        const asset = await storage.createBrandAsset({
          name: file.name,
          type: file.type,
          category: file.category,
          value: file.path,
          filePath: file.path,
          mimeType: file.mimeType,
          isActive: true,
          order: 0,
          metadata: null,
        });
        createdAssets.push(asset);
      }
      
      res.json({ 
        success: true, 
        message: `Uploaded ${createdAssets.length} brand assets`,
        assets: createdAssets 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error uploading brand assets:", error);
        res.status(500).json({ message: "Failed to upload brand assets" });
      }
    }
  });

  // Get brand application history
  app.get("/api/brand/history", generalApiLimiter, async (req, res) => {
    try {
      const history = await storage.getBrandApplicationHistory();
      res.json(history);
    } catch (error) {
      console.error("Error fetching brand history:", error);
      res.status(500).json({ message: "Failed to fetch brand history" });
    }
  });

  // Rollback brand configuration
  app.post("/api/brand/rollback/:historyId", generalApiLimiter, async (req, res) => {
    try {
      const historyId = parseInt(req.params.historyId);
      const success = await storage.rollbackBrandConfiguration(historyId);
      
      if (!success) {
        return res.status(404).json({ message: "History entry not found" });
      }
      
      res.json({ success: true, message: "Brand configuration rolled back successfully" });
    } catch (error) {
      console.error("Error rolling back brand configuration:", error);
      res.status(500).json({ message: "Failed to rollback brand configuration" });
    }
  });

  // Initialize brand assets from extracted files
  app.post("/api/brand/initialize", generalApiLimiter, async (req, res) => {
    try {
      const brandColors = [
        { name: "Deep Sapphire Blue", type: "color", category: "primary", value: "#082567", metadata: { rgb: "8, 37, 103", cmyk: "92% 56% 0% 27%" } },
        { name: "Sleek Charcoal Grey", type: "color", category: "primary", value: "#36454F", metadata: { rgb: "54, 69, 79", cmyk: "32% 13% 0% 69%" } },
        { name: "Vibrant Teal", type: "color", category: "primary", value: "#00D1CF", metadata: { rgb: "0, 209, 207", cmyk: "100% 0% 1% 18%" } },
        { name: "Brushed Silver", type: "color", category: "accent", value: "#C1C4C7", metadata: { rgb: "193, 196, 199", cmyk: "3% 2% 0% 22%" } },
        { name: "Modern Rose Gold", type: "color", category: "accent", value: "#B76E79", metadata: { rgb: "183, 110, 121", cmyk: "0% 40% 34% 28%" } },
        { name: "Chrome Accent", type: "color", category: "accent", value: "#D0D0D0", metadata: { rgb: "208, 208, 208", cmyk: "0% 0% 0% 18%" } },
        { name: "Light Background", type: "color", category: "supporting", value: "#F5F7FA", metadata: { rgb: "245, 247, 250", cmyk: "2% 1% 0% 2%" } },
        { name: "Dark Background", type: "color", category: "supporting", value: "#1A2330", metadata: { rgb: "26, 35, 48", cmyk: "46% 27% 0% 81%" } },
      ];

      const brandFonts = [
        { name: "HEIMDAL", type: "font", category: "primary", value: "HEIMDAL", metadata: { weight: "400,500,600,700", style: "sans-serif" } },
        { name: "Garamond", type: "font", category: "secondary", value: "Garamond", metadata: { weight: "400,400i,600", style: "serif" } },
      ];

      const brandLogos = [
        { name: "Logo Primary Light", type: "logo", category: "primary", value: "/attached_assets/run-your-trip-assets/logo_primary_light.svg", filePath: "/attached_assets/run-your-trip-assets/logo_primary_light.svg", mimeType: "image/svg+xml" },
        { name: "Logo Primary Dark", type: "logo", category: "primary", value: "/attached_assets/run-your-trip-assets/logo_primary_dark.svg", filePath: "/attached_assets/run-your-trip-assets/logo_primary_dark.svg", mimeType: "image/svg+xml" },
        { name: "Logo Symbol Only", type: "logo", category: "secondary", value: "/attached_assets/run-your-trip-assets/logo_symbol_only.svg", filePath: "/attached_assets/run-your-trip-assets/logo_symbol_only.svg", mimeType: "image/svg+xml" },
      ];

      const createdAssets = [];

      // Create color assets
      for (const color of brandColors) {
        const asset = await storage.createBrandAsset({
          ...color,
          isActive: true,
          order: createdAssets.length,
          metadata: color.metadata as any,
        });
        createdAssets.push(asset);
      }

      // Create font assets
      for (const font of brandFonts) {
        const asset = await storage.createBrandAsset({
          ...font,
          isActive: true,
          order: createdAssets.length,
          metadata: font.metadata as any,
        });
        createdAssets.push(asset);
      }

      // Create logo assets
      for (const logo of brandLogos) {
        const asset = await storage.createBrandAsset({
          ...logo,
          isActive: true,
          order: createdAssets.length,
          metadata: (logo as any).metadata || null,
        });
        createdAssets.push(asset);
      }

      // Create initial brand configuration
      const configuration = await storage.createBrandConfiguration({
        name: "Run Your Trip - New Brand Identity",
        description: "The Global Navigator concept with premium travel focus",
        isActive: true,
        isDefault: true,
        config: {
          colors: brandColors,
          fonts: brandFonts,
          logos: brandLogos,
          gradients: {
            primary: "linear-gradient(135deg, #082567 0%, #00D1CF 100%)",
          },
        },
      });

      res.json({
        success: true,
        message: "Brand assets initialized successfully",
        assetsCreated: createdAssets.length,
        configuration,
      });
    } catch (error) {
      console.error("Error initializing brand assets:", error);
      res.status(500).json({ message: "Failed to initialize brand assets" });
    }
  });
}