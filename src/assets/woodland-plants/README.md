# 숲 식물 오브젝트

ImageGen 내장 도구로 생성한 숲 성장용 식물 5종입니다. `../spirit-forest-background.png`를 스타일과 색상 참조로 사용했습니다.
각 파일은 실제 알파 채널을 포함한 개별 PNG입니다. `ForestPlants.jsx`에서 기존 배경 위에 독립적인 SVG 이미지 레이어로 배치합니다. 누적 타이머 수행 30분마다 5종 중 하나와 비어 있는 자리 하나를 무작위로 선택하며, 누적 400시간에 최대 800개가 됩니다. 기존 자리 600개와 길처럼 비어 있던 중간 영역의 자리 200개를 사용합니다. 중간의 새 영역에서는 풀과 꽃의 크기를 강조하고 덤불과 어린 나무는 작게 표시합니다. 정령 바로 주변에는 여백을 둡니다. 종류와 자리 번호는 정령 성장 기록과 함께 로컬스토리지에 저장합니다.

| 오브젝트 | 이미지 | 용도 |
| --- | --- | --- |
| 작은 풀 포기 | [grass-tuft.png](grass-tuft.png) | 초기 성장 단계의 작은 풀 포기 |
| 고사리 | [woodland-fern.png](woodland-fern.png) | 중간 성장 단계의 고사리 |
| 둥근 덤불 | [round-shrub.png](round-shrub.png) | 울창한 단계의 둥근 덤불 |
| 꽃풀 | [wildflower-clump.png](wildflower-clump.png) | 숲 가장자리의 꽃 포인트 |
| 어린 나무 | [young-sapling.png](young-sapling.png) | 성숙 단계의 어린 나무 |

전체 생성 프롬프트와 후처리 편집 프롬프트는 각 `.prompt.md`에 저장했습니다. `.json`은 알파 채널로 측정한 오브젝트의 경계와 기준점입니다.
