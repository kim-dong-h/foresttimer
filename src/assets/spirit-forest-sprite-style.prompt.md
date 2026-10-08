# Forest background style harmonization candidate

Generated and edited with the built-in ImageGen tool. This is a comparison candidate, saved separately from the current live background.

Final image: `spirit-forest-sprite-style.png`

Composition reference: `spirit-forest-background.png`. Style references: `woodland-plants/grass-tuft.png`, `woodland-fern.png`, `round-shrub.png`, and `young-sapling.png`.

Preview: `../../artifacts/forest-style-preview.html` uses the original PNG plants, the same slot geometry, and isolated preview data. Small object rendering still differs in pixel density depending on display size; the candidate harmonizes shape language, palette and shading rather than guaranteeing an identical pixel grid at every size.

## Initial full prompt

Use case: style-transfer.
Asset type: a replacement-style candidate for an existing woodland timer game's empty background, opaque 1536x1024 landscape (3:2).

Input images: Image 1 is the EDIT TARGET and strict composition/ground-plane reference. Images 2, 3, 4, 5 are STYLE REFERENCES ONLY: existing grass, fern, shrub, sapling PNG sprites. Study their actual plant forms, olive edges, chunky stepped leaf silhouettes, graphic separated color clusters, limited bright yellow-green/sage/olive shading and clean readable shapes. Ignore all transparent/black surrounding pixels and preview halos in the plant reference images.

Primary request: Redraw ONLY the background's rendering style so its trees, canopy foliage, rocks and ground look like they were drawn by the SAME pixel artist as these plant sprites. Keep the existing forest composition and exact ground geometry. This is an EMPTY INITIAL-GROWTH background for overlaying separately stored sprites; DO NOT place the reference plants into the image.
Style/medium: crisp charming botanical game pixel art, deliberately shaped leaf clusters, controlled stair-step silhouettes, dark olive edge shading, clearly separated 4–6 shade ramps per material, warm yellow-green top-left highlights. Foreground trees use rounded stylized layered leaf masses with individual broad stepped leaves like the shrub/sapling style references, bark is warm chestnut with clear ochre highlights and deep olive-brown shadow bands. Rocks have simplified blocky faces and matching moss clusters. Ground uses calm broad muted ochre-earth color patches with restrained honey-lit shapes. Reduce fine grain and painterly mottling substantially. Clean readable pixel shapes with gentle edges but no blur, no high-frequency stippling, no airbrush gradients, no smooth vector shapes, no 3D. Use a moderately detailed pixel-game background, not giant 8-bit block art; keep clarity consistent with the botanical sprites.
Preserve invariants: the SAME landscape composition, camera, horizon, ground level, left and right giant framing trunks and overarching branches, central and distant tree positions, mossy edge rock positions, golden upper-left morning sunlight, open earthen lower half. All ground anchors in the original scene must still lie on the same ground. Keep the tree roots at exactly their existing positions and preserve the usable clearing from y=520 to y=1024. The pet area near x=480,y=808 remains empty and quiet. Distant forest can use subdued sage shapes for atmospheric depth, with fewer shade steps rather than blur.
Vegetation constraints: sparse existing tiny grass near perimeter only; no new bushes, ferns, flower beds, saplings or large foreground plants. Do not grow foliage into the clearing: all collectible growth will be actual separate PNG sprites added later.
Avoid: campgrounds, tents, fire, props, characters, faces, animals, people, UI, text, border, watermark, contact sheet, palette labels. One complete full-bleed opaque forest BACKGROUND, with no reference sprites composited into it.

## Final stronger style edit prompt

Use case: style-transfer.
Image 1 is the edit target: a first attempt at harmonizing our forest background with the plant sprites, but it still looks too finely textured and painterly. Images 2–5 are style references only: the grass, fern, shrub and sapling sprites.
Make ONE targeted stronger change: redraw image 1 with substantially simpler, more graphic botanical pixel forms matching images 2–5. Make the change VISIBLY SIGNIFICANT, not another minor sharpen.
Foreground oak leaf clusters should have the same distinct broad stepped leaf shapes, dark olive shadow edges, bright warm yellow-green top surfaces and 4–5 clearly separated shade blocks as the shrub/sapling references. Simplify each moss patch to a few rounded leaf masses. Bark has clear warm chestnut and ochre planes with dark selective outlines instead of dense noisy bark grain. Edge boulders have clean angular stepped planes. Earth in the clearing is calm simple muted ochre-brown with fewer, larger clean golden light patches and greatly reduced stippled noise. Shade boundaries should read as designed pixel shapes, with no muddy smeared texture. Overall charming softly rounded botanical sprite aesthetic with crisp stepped edges, as in a cohesive cozy pixel game. A medium-coarse logical background grid around 256x170, visually enlarged onto a 1536x1024 landscape. Use broad readable clusters and an economical material palette, not giant abstract 8-bit blocks, not smooth vector, not a blur filter.
Preserve EXACTLY the composition, ground plane and usable clearing, oak trunk positions and tree roots, perspective, rock locations and sunny upper-left lighting. The lower half and the character standing zone near x480,y808 stay mostly bare; collectible plants will be real separate sprites drawn later. Sparse grass only at existing edges. No newly embedded shrubs, ferns, flowers or saplings. Do not composite reference objects into the backdrop. Ignore surrounding black/alpha preview halos from sprite references.
One opaque 3:2 1536x1024 background. No pets, faces, creatures, campsites, props, furniture, people, UI, text, labels, watermarks or borders.
