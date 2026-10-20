# TOMOB v8 · 기획과 디자인을 구현까지

고객의 의도 → 제품 콘셉트 → 디자인 방향 → 핵심 경험 시제품 → 구현 → 경험 검수로 이어지는 에이전트 운영 지침입니다. 고정 스프린트 일정은 두지 않습니다.

## 구성

- **앤**: 메인 대화의 진행 책임자. 원문, 결정 이유, 버전, 다음 작업을 유지합니다.
- **다섯 역할**: Prototyper, Builder, Sweeper, Grower, Maintainer.
- **아크**: 산출물과 근거를 독립적으로 확인하는 검토 역할.
- 기존 22개 캐릭터의 전문성은 [역할 매핑](docs/ROLES.md)에 보존합니다. 22개 세션을 항상 실행하지 않습니다.

## 시작

이 저장소를 Claude Code에서 열고 다음과 같이 요청합니다.

> 앤, [제품/작업]을 진행하자. 대상 프로젝트는 [경로]야. 먼저 기존 결정과 자료를 읽고, 제품 콘셉트와 핵심 경험부터 구체화해줘.

`CLAUDE.md`가 메인 대화를 앤으로 안내하고 `.claude/agents/`의 여섯 파일이 전문 역할을 정의합니다. 새 디렉터리가 실행 중 세션에서 인식되지 않으면 세션을 다시 여세요. 모델은 현재 세션 설정을 상속합니다. 별도 API 키, 데몬, 자동 배포는 추가하지 않습니다.

다른 도구에서는 [AGENTS.md](AGENTS.md)와 [운영 계약](TOMOB_SYSTEM.md)을 읽고 같은 역할을 순차적으로 수행할 수 있습니다. 서브에이전트를 지원하지 않으면 호출한 것처럼 보고하지 않습니다.

기존 제품 저장소에 적용할 때는 `TOMOB_SYSTEM.md`, `docs/`, `templates/`, `.claude/agents/`를 필요한 위치에 함께 두고 기존 `CLAUDE.md` 또는 `AGENTS.md`에 운영 계약의 경로를 추가합니다. 기존 지침을 통째로 덮어쓰지 말고, 동일한 파일명과 규칙 충돌을 먼저 확인하세요. 별도 폴더에 둘 경우 메인 대화가 각 호출에 절대 경로 `system_root`, `project_root`, `product_record`를 전달합니다.

## 읽을 문서

| 목적 | 문서 |
| --- | --- |
| 전체 흐름과 권한 | [TOMOB_SYSTEM.md](TOMOB_SYSTEM.md) |
| 좋은 기획·디자인을 만드는 과정 | [EXPERIENCE.md](docs/EXPERIENCE.md) |
| 역할과 기존 캐릭터 | [ROLES.md](docs/ROLES.md) |
| 사람의 판단과 변경 처리 | [DECISIONS.md](docs/DECISIONS.md) |
| 제품 기록 시작 | [PRODUCT.md](templates/PRODUCT.md) |
| 결과물을 함께 보는 검토 자료 | [REVIEW.md](templates/REVIEW.md) |
| 역할 간 인계 | [HANDOFF.md](templates/HANDOFF.md) |
| 기존 규칙 변경과 근거 | [MIGRATION.md](docs/MIGRATION.md) |
| 설정 검증과 시나리오 점검 | [VALIDATION.md](docs/VALIDATION.md) |

`index.html`은 운영안 안내 페이지입니다. 자동 실행·승인·감시 기능이 있는 대시보드가 아닙니다. 이전 페이지는 [v7 기록](archive/v7.html)으로 보존하며 현재 규칙으로 사용하지 않습니다.

## 적용 범위와 검증

이 버전은 실제로 읽고 호출할 수 있는 **지침·역할 정의 패키지**입니다. 문서의 상태와 승인 기록을 강제하는 서버나 실행 엔진은 없습니다. 승인 기록은 메인 대화가 실제 사용자 발언과 결과물 버전을 근거로 유지하며, 문서에 `accepted`라고 쓰는 것만으로 권한을 얻지 못합니다.

설정과 문서 연결 확인: `node scripts/check-system.mjs`

페이지 미리보기: `python3 -m http.server 8765 --bind 127.0.0.1`

Claude Code 파일 형식: [공식 subagent 문서](https://code.claude.com/docs/en/sub-agents). ZEDER 참고 범위와 한계는 [마이그레이션 문서](docs/MIGRATION.md)에 기록합니다. 실제 제품 성과와 에이전트 결과 품질은 별도 사용 검증이 필요합니다.
