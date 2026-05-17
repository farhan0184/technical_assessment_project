import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export const getSurahs = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search as string | undefined;

  try {
    const surahs = await prisma.quran.findMany({
      where: search
        ? {
            OR: [
              { surah_name: { contains: search } },
              { transliteration: { contains: search } },
            ],
          }
        : undefined,
      distinct: ['surah_number'],
      select: {
        surah_number: true,
        surah_name: true,
        transliteration: true,
        type: true,
      },
      orderBy: {
        surah_number: 'asc',
      },
    });

    ApiResponse.success(res, surahs, 'Surahs fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getSurahByNumber = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const surahId = Array.isArray(id) ? id[0] : id;
  const idStr = surahId as string;
  const isNumber = /^\d+$/.test(idStr);

  try {
    const verses = await prisma.quran.findMany({
      where: isNumber
        ? { surah_number: parseInt(idStr) }
        : {
            OR: [
              { transliteration: { contains: idStr } },
              { surah_name: { contains: idStr } },
              { translation: { contains: idStr } },
            ],
          },
      orderBy: {
        verse_number: 'asc',
      },
    });

    if (verses.length === 0) {
      throw new AppError(`Surah '${idStr}' not found`, 404);
    }

    ApiResponse.success(res, verses, `Surah fetched successfully`);
  } catch (error) {
    next(error);
  }
};
