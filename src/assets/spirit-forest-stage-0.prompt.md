# 숲 성장 0단계 — 초기 빈터

Image: `spirit-forest-stage-0.png`
Generated and edited with the built-in ImageGen tool.
Original composition reference: `spirit-forest.png`.

도트를 크게 뭉친 부드러운 픽셀 스타일의 초기 배경입니다. 나무와 길은 유지하고, 수풀을 걷어내 소수의 풀잎만 남겼습니다. 추후 누적 시간이 늘어날 때 같은 구도에 수풀을 추가하는 성장 배경의 기준 이미지로 사용할 수 있습니다.

## Sparse starting-stage edit prompt

```text
Use case: precise-object-edit.
Asset type: STAGE 0 starting forest background for a cozy virtual-pet focus timer; the forest will gain more undergrowth as cumulative timer hours increase in future stages.
Input image: edit target and composition reference, the existing detailed woodland clearing.
Primary request: Redraw the referenced forest with MUCH LARGER, softer, simplified pixel clusters, and substantially remove the bushes and undergrowth so this clearly feels like the starting growth stage. This should be a cozy sparse living woodland, still warm and welcoming.
Style/medium: chunky softly blended retro pixel-art background. Simulate a low logical resolution around 192 by 128 pixels enlarged to a landscape 3:2 canvas. Large broad readable color blocks, simplified rounded foliage masses, gently softened transitions, fewer colors and reduced texture. Fine tiny leaf pixels and granular detail should merge into larger softly shaped pixel clusters. Soft pixel art with visible block structure, not sharp high-detail dithering; not a Gaussian-blurred copy and not smooth vector art.
Preserve invariants: SAME camera view, landscape 3:2 composition, main left and right framing tree trunks and their leaning overhead branches, the recognizable central background tree positions, distant forest path and warm sunlight direction. Keep the golden dappled morning-light mood and muted moss/sage/olive greens, chestnut bark, warm sandy earth. Ground plane and distant path placement must stay consistent so later growth variants can reuse exactly this scene.
Requested vegetation changes: Remove approximately 85–90 percent of all foreground and middle-ground shrubs, dense fern beds, flower patches and mushrooms. Large framing trees still have their green canopy overhead; the forest is alive. Expose substantially more clean warm earth beneath the trees and on both sides of the path. Retain just a FEW short isolated grass tufts and tiny moss patches near the roots, a couple simple small mossy rocks at the edges, NO established bushes, NO large fern clumps, NO carpet of flowers. Wider breathing space between the visible background tree trunks. Avoid a bare desert, dead trees or deforestation look.
Composition: lower third is an open gently lit clearing with very sparse broad ground shading and almost no decorative texture. Keep the character standing area at 31 percent width, 79 percent height completely unobstructed, with quiet space for a leafy crown. Detail is reduced everywhere consistently. No new objects or character.
Constraints: one complete opaque background only; no spirit, animal, person or faces. No tents, fire, campsites, lanterns, signs, furniture, buildings, tools, UI, words, borders or watermark. No large foreground plants. No contact sheet.
```

## Final chunky pixel-art style prompt

```text
Use case: style-transfer.
Input image: EDIT TARGET, a sparse starting-stage forest background.
Primary request: Change ONLY the rendering style into much chunkier, softer, lower-detail cozy pixel art. Keep the same sparse vegetation, same trees in the same positions, same path, open bare-earth clearing, rocks, camera and warm light. Do not add bushes or flowers.
The original image still has far too many tiny pixels and detailed textures. Simplify it strongly. Redraw on an approximately 128 by 85 logical pixel grid, shown enlarged on a landscape 3:2 canvas. Distinct LARGE pixel blocks, softly shaped broad color masses. Each entire canopy leaf group should be rendered as a simple rounded cluster rather than individual little leaves. Tree bark should use a few broad warm color bands rather than granular texture. The ground should consist of big softly mottled brown and honey patches without tiny individual speckles. Background trees should be broad simplified faded sage silhouettes. Reduce small detail by about 75 percent. Preserve pixel art stair-step silhouettes, with gentle soft color transitions between large clusters. Quiet muted green-and-honey palette, reduced contrast, dreamy friendly pixel-game mood. Not a detailed digital painting and not merely a blur filter applied to the existing image.
Preserve the open initial-growth stage: only a few isolated very small grass tufts, no established shrubs or fern clumps. Leave the foreground mostly empty. Preserve quiet sprite placement space at 31 percent width and 79 percent height.
Constraints: one complete opaque landscape background, no character, animal, person, tent, campfire, camping objects, text, UI, label, watermark or border. Same scene and composition, only stronger simplification and chunkier softer pixels.
```

