import { describe, it, expect, vi, beforeEach } from 'vitest';
import SchoolService from '../../src/services/school.service.js';

describe('SchoolService - getAllSchool()', () => {
  let service;

  beforeEach(() => {
    service = new SchoolService();
    service.schoolRepository = {
      findSchoolBySchoolName: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should return list of schools when valid schoolName is given', async () => {
    const mockSchools = [{ id: 1, name: '테스트고등학교' }];
    service.schoolRepository.findSchoolBySchoolName.mockResolvedValue(
      mockSchools,
    );

    const result = await service.getAllSchool('테스트');
    expect(
      service.schoolRepository.findSchoolBySchoolName,
    ).toHaveBeenCalledWith('테스트');
    expect(result).toEqual(mockSchools);
  });

  it('should return empty list if no school matches', async () => {
    service.schoolRepository.findSchoolBySchoolName.mockResolvedValue([]);

    const result = await service.getAllSchool('없는학교');
    expect(result).toEqual([]);
  });
});
