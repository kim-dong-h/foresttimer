# 고사리

Image: `woodland-fern.png`
Generated with the built-in ImageGen tool.
Style reference: `../spirit-forest-background.png`
Use: 중간 성장 단계의 고사리.

## Generation prompt

```text
Use case: stylized-concept.
Asset type: one standalone vegetation object sprite, to be composited over an existing cozy woodland virtual-pet game's background.
Input image: STYLE AND PALETTE REFERENCE ONLY. This image shows the existing woodland clearing. Use its warm natural pixel-art rendering, chunky color clusters, sage/olive/moss greens and golden sunlight. Do not reproduce the scene, tree trunks, floor or path.
Primary request: Draw ONLY the requested single botanical object, isolated on genuinely transparent alpha.
Style/medium: charming natural 2D pixel art environment sprite, large deliberate square pixel clusters and gently softened color masses, like the woodland background. Approximate logical sprite resolution around 96 by 96 pixels, visibly blocky restrained shading, not smooth vector, 3D, photograph or tiny high-detail illustration. Silhouette reads clearly when displayed small. Natural dark olive shading at edges rather than a thick cartoon outline.
Camera/composition: mostly front-facing slight three-quarter view, subtly looking down enough to match the forest ground plane. One coherent object centered in a square canvas, occupies about 65–75 percent of width or height as appropriate to its shape. Entire object visible with generous transparent safety margins. Plant stems emerge together at one neat ground contact point or short flat baseline near the lower quarter.
Lighting/palette: soft warm light from upper left, pale honey highlights on upper leaves, sage and moss greens, olive shadows, restrained chestnut stem accents, cozy quiet woodland mood.
Constraints: one object only, no sprite sheet, no variations or duplicate objects. No face, eyes, mascot, spirit, animal or person. No container, pot, pedestal, soil mound, tile, root ball or ground plane. No scene or backdrop, no cast shadow outside the plant, no stray floating pixels, no text, UI, labels, watermark, border or checkerboard baked into image. Actual transparent background.
Subject:
One charming compact woodland fern growing from one small connected center. FIVE graceful broad fronds: a taller central one and two pairs fanning outward, each with simplified chunky paired leaflets. Fronds arch softly, fresh sage-green and moss-green leaves with golden dappled highlights. Balanced elegant silhouette, no additional plants. Suitable for a growing undergrowth stage.
```

## Final cutout edit prompt

```text
Use case: background-extraction.
Input image: EDIT TARGET, a single pixel-art woodland plant.
Primary request: Remove absolutely ALL the yellow-green glow, blurry halo, translucent fog, haze, colored background wash, shadow and bloom surrounding this plant. Keep ONLY the actual solid leaf blades, leaflets and connected stems as a clean isolated game sprite on genuine transparent alpha.
Preserve invariants: exact plant silhouette, pixel-art rendering, leaf arrangement, connected stem base, green and olive colors, golden highlights ON the leaves, existing scale and composition. Do not add new leaves or delete any actual leaves. Lighting highlights remain confined to the physical leaf surfaces, no emitted light.
Alpha requirements: Every area outside the solid plant silhouette must have alpha ZERO, including the spaces between leaves and around individual leaf edges. The leaves and stems must be fully opaque except for at most a one-pixel antialiasing boundary. Hard clean cutout of the existing pixel-art plant. NO soft feathering, NO translucent aura, NO color spill, NO checkerboard pattern drawn in the image. No floor, container or text.
Produce one complete isolated plant sprite with its entire silhouette visible. This is a grounded woodland plant, not a magical glowing object.
```

