import { NextRequest } from 'next/server';
import { ImageResponse } from '@vercel/og';
import { prisma } from '@/lib/prisma';
import { TALENTS } from '@/lib/talents';

export const runtime = 'edge';

const TALENT_CONFIG = TALENTS.reduce((acc, t) => {
  acc[t.id] = {
    symbol: t.titleSymbolic.match(/\((.+?)\)/)?.[1] || t.code,
    color: getTalentColor(t.id),
    reportTitle: t.reportTitle || t.quizTitle,
  };
  return acc;
}, {} as Record<number, { symbol: string; color: string; reportTitle: string }>);

function getTalentColor(id: number): string {
  const colorMap: Record<number, string> = {
    1: '#DC2626', 2: '#8B5CF6', 3: '#7C3AED', 4: '#EF4444',
    5: '#F59E0B', 6: '#06B6D4', 7: '#10B981', 8: '#D97706',
  };
  return colorMap[id] || '#64748b';
}

function splitTalentTitle(title: string): [string, string] {
  if (title.includes(' y ')) {
    const parts = title.split(' y ');
    if (parts.length === 2) return [parts[0] + ' y', parts[1]];
  }
  if (title.includes(' e ')) {
    const parts = title.split(' e ');
    if (parts.length === 2) return [parts[0] + ' e', parts[1]];
  }
  const words = title.split(' ');
  if (words.length <= 2) return [title, ''];
  const midPoint = Math.ceil(words.length / 2);
  return [words.slice(0, midPoint).join(' '), words.slice(midPoint).join(' ')];
}

const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const person = await prisma.submission.findUnique({
      where: { id },
      include: { assessments: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!person || !person.assessments[0]) {
      return new Response('Not found', { status: 404 });
    }

    const assessment = person.assessments[0];
    const scores: Array<{ talentId: number; score: number; max: number }> = Array.isArray(assessment.scoresJson)
      ? assessment.scoresJson
          .map((x: any) => ({
            talentId: Number(x?.talentId),
            score: Number(x?.score ?? 0),
            max: Number(x?.max ?? 0),
          }))
          .filter((x: any) => Number.isFinite(x.talentId))
      : [];

    const talents = TALENT_ORDER.map((talentId) => {
      const scoreData = scores.find((s) => s.talentId === talentId);
      const config = TALENT_CONFIG[talentId];
      const score = scoreData?.score ?? 0;
      const maxScore = scoreData?.max ?? 15;
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const [line1, line2] = splitTalentTitle(config.reportTitle);
      return { id: talentId, symbol: config.symbol, color: config.color, percentage, titleLine1: line1, titleLine2: line2 };
    });

    return new ImageResponse(
      (
        <div
          style={{
            width: '800px',
            height: '800px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            position: 'relative',
          }}
        >
          {/* Grid de talentos */}
          <div style={{ display: 'flex', flexWrap: 'wrap', width: '700px', gap: '20px', justifyContent: 'center' }}>
            {talents.map((talent) => (
              <div
                key={talent.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '150px',
                  padding: '20px',
                  border: `3px solid ${talent.color}`,
                  borderRadius: '12px',
                }}
              >
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: talent.color, marginBottom: '10px' }}>
                  {talent.symbol}
                </div>
                <div style={{ fontSize: '14px', textAlign: 'center', marginBottom: '10px', height: '40px' }}>
                  {talent.titleLine1} {talent.titleLine2}
                </div>
                <div
                  style={{
                    width: '120px',
                    height: '16px',
                    background: '#e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      width: `${talent.percentage}%`,
                      height: '16px',
                      background: talent.color,
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: talent.color }}>{talent.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      ),
      {
        width: 800,
        height: 800,
      }
    );
  } catch (error) {
    console.error('Error generando diagrama:', error);
    return new Response('Error', { status: 500 });
  }
}
