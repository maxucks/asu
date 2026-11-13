import { SEED_STUDY_RECORDS } from "@asu/contracts/dev-seed"
export { SEED_STUDY_RECORDS } from "@asu/contracts/dev-seed"

export class MockStudyRecordDataSource {
  async listDueStudyRecordDtos() {
    return SEED_STUDY_RECORDS
  }
}
