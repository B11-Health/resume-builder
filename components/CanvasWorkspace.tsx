'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Line, Rect, Stage, Text as KonvaText, Group, Transformer } from 'react-konva';
import { ResumeData } from '../types';
import { FONT_OPTIONS, TEMPLATE_STYLES } from './resume/constants';
import { FontFamilyId, TemplateStyle, ThemeOverrides } from './resume/types';

const PAGE_WIDTH = 816; // ~8.5in at 96dpi
const PAGE_HEIGHT = 1056; // ~11in at 96dpi
const GRID_SIZE = 8;

const FONT_LOOKUP: Record<FontFamilyId, string> = {
  inter: 'Inter, sans-serif',
  lato: 'Lato, sans-serif',
  poppins: 'Poppins, sans-serif',
  playfair: 'Playfair Display, serif',
  'source-serif': 'Source Serif 4, serif',
};

type ElementBinding =
  | { type: 'field'; path: keyof ResumeData | 'personalInfo.fullName' | 'personalInfo.jobTitle' | 'personalInfo.email' | 'personalInfo.phone' | 'personalInfo.location' | 'personalInfo.linkedin' | 'personalInfo.website' }
  | { type: 'array'; path: 'skills' | 'languages'; index: number }
  | { type: 'experience'; index: number; subField: 'role' | 'company' | 'dates' | 'description' }
  | { type: 'education'; index: number; subField: 'degree' | 'institution' | 'dates' };

type CanvasElement = {
  id: string;
  kind: 'text' | 'chip' | 'label';
  x: number;
  y: number;
  width: number;
  height: number;
  padding?: number;
  text: string;
  fontSize: number;
  fontFamily: FontFamilyId;
  fill: string;
  align?: 'left' | 'center' | 'right';
  draggable?: boolean;
  binding?: ElementBinding;
};

const snap = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

const hydrateElementsFromResume = (
  data: ResumeData,
  template: TemplateStyle,
  themeOverrides?: ThemeOverrides
): CanvasElement[] => {
  const style = TEMPLATE_STYLES[template] ?? TEMPLATE_STYLES.modern;
  const accentColor = themeOverrides?.accentColor || style.accentColor;
  const bodyFont = themeOverrides?.bodyFont || style.bodyFont;
  const headerFont: FontFamilyId = style.bodyFont;

  const elements: CanvasElement[] = [];
  const margin = 48;
  const columnGap = 24;
  const leftWidth = PAGE_WIDTH * 0.38;
  const rightWidth = PAGE_WIDTH - margin * 2 - leftWidth - columnGap;

  elements.push({
    id: 'full-name',
    kind: 'text',
    x: margin,
    y: 48,
    width: PAGE_WIDTH - margin * 2,
    height: 48,
    text: data.personalInfo.fullName,
    fontSize: 32,
    fontFamily: headerFont,
    fill: style.headerTitleColor,
    align: 'left',
    draggable: true,
    binding: { type: 'field', path: 'personalInfo.fullName' },
  });

  elements.push({
    id: 'job-title',
    kind: 'text',
    x: margin,
    y: 90,
    width: PAGE_WIDTH - margin * 2,
    height: 32,
    text: data.personalInfo.jobTitle,
    fontSize: 18,
    fontFamily: bodyFont,
    fill: style.headerSubtitleColor,
    align: 'left',
    draggable: true,
    binding: { type: 'field', path: 'personalInfo.jobTitle' },
  });

  const contactStart = 160;
  const contactLines = [
    { id: 'email', value: data.personalInfo.email, label: 'Correo', path: 'personalInfo.email' as const },
    { id: 'phone', value: data.personalInfo.phone, label: 'Teléfono', path: 'personalInfo.phone' as const },
    { id: 'location', value: data.personalInfo.location, label: 'Ubicación', path: 'personalInfo.location' as const },
  ];

  contactLines.forEach((line, idx) => {
    elements.push({
      id: `contact-${line.id}`,
      kind: 'text',
      x: margin,
      y: contactStart + idx * 26,
      width: leftWidth,
      height: 22,
      text: `${line.label}: ${line.value}`,
      fontSize: 13,
      fontFamily: bodyFont,
      fill: style.sidebarTextColor,
      align: 'left',
      draggable: true,
      binding: { type: 'field', path: line.path },
    });
  });

  elements.push({
    id: 'summary',
    kind: 'text',
    x: margin,
    y: contactStart + contactLines.length * 26 + 20,
    width: rightWidth,
    height: 120,
    text: data.summary,
    fontSize: 14,
    fontFamily: bodyFont,
    fill: style.sidebarTextColor,
    align: 'left',
    draggable: true,
    binding: { type: 'field', path: 'summary' },
  });

  data.skills.forEach((skill, idx) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    elements.push({
      id: `skill-${idx}`,
      kind: 'chip',
      x: margin + col * ((leftWidth - 16) / 3) + col * 8,
      y: contactStart + contactLines.length * 26 + 180 + row * 36,
      width: (leftWidth - 16) / 3,
      height: 28,
      padding: 8,
      text: skill,
      fontSize: 12,
      fontFamily: bodyFont,
      fill: style.sidebarTextColor,
      align: 'center',
      draggable: true,
      binding: { type: 'array', path: 'skills', index: idx },
    });
  });

  data.languages.forEach((lang, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    elements.push({
      id: `language-${idx}`,
      kind: 'chip',
      x: margin + col * ((leftWidth - 8) / 2) + col * 8,
      y: contactStart + contactLines.length * 26 + 280 + row * 36,
      width: (leftWidth - 8) / 2,
      height: 28,
      padding: 8,
      text: lang,
      fontSize: 12,
      fontFamily: bodyFont,
      fill: style.sidebarTextColor,
      align: 'center',
      draggable: true,
      binding: { type: 'array', path: 'languages', index: idx },
    });
  });

  let experienceY = contactStart + contactLines.length * 26 + 20;

  data.experience.forEach((item, idx) => {
    const blockY = experienceY + idx * 150;
    elements.push({
      id: `experience-role-${idx}`,
      kind: 'text',
      x: margin + leftWidth + columnGap,
      y: blockY,
      width: rightWidth,
      height: 26,
      text: item.role,
      fontSize: 16,
      fontFamily: bodyFont,
      fill: style.sidebarTextColor,
      draggable: true,
      binding: { type: 'experience', index: idx, subField: 'role' },
    });

    elements.push({
      id: `experience-company-${idx}`,
      kind: 'text',
      x: margin + leftWidth + columnGap,
      y: blockY + 26,
      width: rightWidth,
      height: 22,
      text: item.company,
      fontSize: 13,
      fontFamily: bodyFont,
      fill: accentColor,
      draggable: true,
      binding: { type: 'experience', index: idx, subField: 'company' },
    });

    elements.push({
      id: `experience-dates-${idx}`,
      kind: 'text',
      x: margin + leftWidth + columnGap,
      y: blockY + 48,
      width: rightWidth,
      height: 22,
      text: `${item.startDate} — ${item.endDate}`,
      fontSize: 12,
      fontFamily: bodyFont,
      fill: style.sidebarTextColor,
      draggable: true,
      binding: { type: 'experience', index: idx, subField: 'dates' },
    });

    elements.push({
      id: `experience-description-${idx}`,
      kind: 'text',
      x: margin + leftWidth + columnGap,
      y: blockY + 74,
      width: rightWidth,
      height: 60,
      text: item.description.join('\n'),
      fontSize: 12,
      fontFamily: bodyFont,
      fill: style.sidebarTextColor,
      draggable: true,
      binding: { type: 'experience', index: idx, subField: 'description' },
    });
  });

  const educationBaseY = contactStart + contactLines.length * 26 + 20 + data.experience.length * 150 + 40;

  data.education.forEach((item, idx) => {
    const blockY = educationBaseY + idx * 110;
    elements.push({
      id: `education-degree-${idx}`,
      kind: 'text',
      x: margin + leftWidth + columnGap,
      y: blockY,
      width: rightWidth,
      height: 24,
      text: item.degree,
      fontSize: 15,
      fontFamily: bodyFont,
      fill: style.sidebarTextColor,
      draggable: true,
      binding: { type: 'education', index: idx, subField: 'degree' },
    });

    elements.push({
      id: `education-institution-${idx}`,
      kind: 'text',
      x: margin + leftWidth + columnGap,
      y: blockY + 24,
      width: rightWidth,
      height: 20,
      text: item.institution,
      fontSize: 13,
      fontFamily: bodyFont,
      fill: accentColor,
      draggable: true,
      binding: { type: 'education', index: idx, subField: 'institution' },
    });

    elements.push({
      id: `education-dates-${idx}`,
      kind: 'text',
      x: margin + leftWidth + columnGap,
      y: blockY + 46,
      width: rightWidth,
      height: 20,
      text: `${item.startDate} — ${item.endDate}`,
      fontSize: 12,
      fontFamily: bodyFont,
      fill: style.sidebarTextColor,
      draggable: true,
      binding: { type: 'education', index: idx, subField: 'dates' },
    });
  });

  return elements;
};

const elementsToResumeData = (elements: CanvasElement[], current: ResumeData): ResumeData => {
  const draft: ResumeData = {
    ...current,
    htmlResume: undefined,
    personalInfo: { ...current.personalInfo },
    summary: current.summary,
    skills: [...current.skills],
    languages: [...current.languages],
    experience: current.experience.map((item) => ({ ...item, description: [...item.description] })),
    education: current.education.map((item) => ({ ...item })),
  };

  elements.forEach((el) => {
    if (!el.binding) return;

    if (el.binding.type === 'field') {
      if (el.binding.path === 'summary') {
        draft.summary = el.text;
      } else if (el.binding.path === 'personalInfo.email') {
        draft.personalInfo.email = el.text.replace(/^Correo:\s*/i, '');
      } else if (el.binding.path === 'personalInfo.phone') {
        draft.personalInfo.phone = el.text.replace(/^Teléfono:\s*/i, '');
      } else if (el.binding.path === 'personalInfo.location') {
        draft.personalInfo.location = el.text.replace(/^Ubicación:\s*/i, '');
      } else if (el.binding.path === 'personalInfo.fullName') {
        draft.personalInfo.fullName = el.text;
      } else if (el.binding.path === 'personalInfo.jobTitle') {
        draft.personalInfo.jobTitle = el.text;
      } else if (el.binding.path === 'personalInfo.linkedin') {
        draft.personalInfo.linkedin = el.text;
      } else if (el.binding.path === 'personalInfo.website') {
        draft.personalInfo.website = el.text;
      }
    }

    if (el.binding.type === 'array') {
      const list = draft[el.binding.path];
      if (!Array.isArray(list)) return;
      list[el.binding.index] = el.text;
    }

    if (el.binding.type === 'experience') {
      const idx = el.binding.index;
      while (draft.experience.length <= idx) {
        draft.experience.push({ company: '', role: '', startDate: '', endDate: '', description: [] });
      }
      const item = draft.experience[idx];
      if (el.binding.subField === 'role') item.role = el.text;
      if (el.binding.subField === 'company') item.company = el.text;
      if (el.binding.subField === 'dates') {
        const [start = '', end = ''] = el.text.split('—').map((part) => part.trim());
        item.startDate = start;
        item.endDate = end;
      }
      if (el.binding.subField === 'description') {
        item.description = el.text.split('\n').map((line) => line.trim()).filter(Boolean);
      }
    }

    if (el.binding.type === 'education') {
      const idx = el.binding.index;
      while (draft.education.length <= idx) {
        draft.education.push({ institution: '', degree: '', startDate: '', endDate: '' });
      }
      const item = draft.education[idx];
      if (el.binding.subField === 'degree') item.degree = el.text;
      if (el.binding.subField === 'institution') item.institution = el.text;
      if (el.binding.subField === 'dates') {
        const [start = '', end = ''] = el.text.split('—').map((part) => part.trim());
        item.startDate = start;
        item.endDate = end;
      }
    }
  });

  return draft;
};

interface CanvasWorkspaceProps {
  data: ResumeData;
  template?: TemplateStyle;
  themeOverrides?: ThemeOverrides;
  onDataChange?: (data: ResumeData) => void;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({ data, template = 'modern', themeOverrides, onDataChange }) => {
  const [elements, setElements] = useState<CanvasElement[]>(() => hydrateElementsFromResume(data, template, themeOverrides));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [guides, setGuides] = useState<{ vertical?: number; horizontal?: number }>({});
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<Transformer>(null);
  const updateSource = useRef<'external' | 'internal'>('external');

  const theme = useMemo(() => TEMPLATE_STYLES[template] ?? TEMPLATE_STYLES.modern, [template]);
  const accentColor = themeOverrides?.accentColor || theme.accentColor;
  const headerBg = themeOverrides?.headerBgColor || theme.headerBgColor;

  useEffect(() => {
    if (updateSource.current === 'internal') {
      updateSource.current = 'external';
      return;
    }
    setElements(hydrateElementsFromResume(data, template, themeOverrides));
  }, [data, template, themeOverrides]);

  useEffect(() => {
    const next = elementsToResumeData(elements, data);
    if (onDataChange) {
      updateSource.current = 'internal';
      onDataChange(next);
    }
  }, [elements]);

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage || !selectedId) return;
    const selectedNode = stage.findOne(`#${selectedId}`);
    if (selectedNode) {
      transformer.nodes([selectedNode]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedId, elements]);

  const handleDragMove = (id: string, pos: { x: number; y: number }) => {
    const snapX = snap(pos.x);
    const snapY = snap(pos.y);
    const nearCenterX = Math.abs(snapX - PAGE_WIDTH / 2) < GRID_SIZE;
    const nearCenterY = Math.abs(snapY - PAGE_HEIGHT / 2) < GRID_SIZE;
    setGuides({
      vertical: nearCenterX ? PAGE_WIDTH / 2 : undefined,
      horizontal: nearCenterY ? PAGE_HEIGHT / 2 : undefined,
    });
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, x: snapX, y: snapY } : el)));
  };

  const handleTransform = (id: string, width: number, height: number, x: number, y: number) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, width: snap(width), height: snap(height), x: snap(x), y: snap(y) } : el))
    );
  };

  const handleTextEdit = (id: string) => {
    const element = elements.find((el) => el.id === id);
    if (!element) return;
    const result = window.prompt('Editar contenido', element.text);
    if (typeof result === 'string') {
      setElements((prev) => prev.map((el) => (el.id === id ? { ...el, text: result } : el)));
    }
  };

  const alignSelection = (direction: 'left' | 'center' | 'right') => {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== selectedId) return el;
        if (direction === 'left') return { ...el, x: snap(48) };
        if (direction === 'center') return { ...el, x: snap(PAGE_WIDTH / 2 - el.width / 2) };
        return { ...el, x: snap(PAGE_WIDTH - el.width - 48) };
      })
    );
  };

  const gridLines = useMemo(() => {
    const lines: JSX.Element[] = [];
    for (let i = GRID_SIZE; i < PAGE_WIDTH; i += GRID_SIZE) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, PAGE_HEIGHT]}
          stroke="#f1f5f9"
          strokeWidth={1}
          listening={false}
        />
      );
    }
    for (let j = GRID_SIZE; j < PAGE_HEIGHT; j += GRID_SIZE) {
      lines.push(
        <Line
          key={`h-${j}`}
          points={[0, j, PAGE_WIDTH, j]}
          stroke="#f8fafc"
          strokeWidth={1}
          listening={false}
        />
      );
    }
    return lines;
  }, []);

  return (
    <div className="relative" id="resume-canvas-workspace">
      <div className="flex items-center gap-2 mb-2 text-xs text-slate-600">
        <span className="font-semibold">Alineación:</span>
        <button
          type="button"
          className="px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50"
          onClick={() => alignSelection('left')}
        >
          Izquierda
        </button>
        <button
          type="button"
          className="px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50"
          onClick={() => alignSelection('center')}
        >
          Centro
        </button>
        <button
          type="button"
          className="px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50"
          onClick={() => alignSelection('right')}
        >
          Derecha
        </button>
      </div>
      <Stage width={PAGE_WIDTH} height={PAGE_HEIGHT} ref={stageRef} className="bg-white shadow-2xl">
        <Layer listening={false}>
          <Rect x={0} y={0} width={PAGE_WIDTH} height={PAGE_HEIGHT} fill="#ffffff" cornerRadius={12} />
          <Rect x={0} y={0} width={PAGE_WIDTH} height={150} fill={headerBg} opacity={0.95} />
          <Rect x={32} y={140} width={PAGE_WIDTH * 0.38} height={PAGE_HEIGHT - 180} fill={theme.sidebarBgColor} opacity={0.92} />
        </Layer>
        <Layer listening={false}>{gridLines}</Layer>
        <Layer>
          {elements.map((el) => (
            <Group
              key={el.id}
              id={el.id}
              x={el.x}
              y={el.y}
              draggable={el.draggable}
              onDragMove={(evt) => handleDragMove(el.id, evt.target.position())}
              onClick={() => setSelectedId(el.id)}
              onTap={() => setSelectedId(el.id)}
              onDblClick={() => handleTextEdit(el.id)}
              onDblTap={() => handleTextEdit(el.id)}
            >
              {el.kind === 'chip' && (
                <Rect
                  x={0}
                  y={0}
                  width={el.width}
                  height={el.height}
                  cornerRadius={14}
                  fill={theme.pillBgColor}
                  stroke={accentColor}
                  strokeWidth={0.75}
                  shadowColor="#000000"
                  shadowOpacity={0.05}
                  shadowBlur={4}
                />
              )}
              <KonvaText
                x={el.kind === 'chip' ? (el.padding ?? 8) : 0}
                y={el.kind === 'chip' ? (el.padding ?? 6) : 0}
                width={el.width - (el.kind === 'chip' ? (el.padding ?? 8) * 2 : 0)}
                height={el.height - (el.kind === 'chip' ? (el.padding ?? 6) * 2 : 0)}
                text={el.text}
                fontSize={el.fontSize}
                fontFamily={FONT_LOOKUP[el.fontFamily]}
                fill={el.fill}
                align={el.align || 'left'}
                listening={false}
              />
            </Group>
          ))}
          <Transformer
            ref={transformerRef}
            rotateEnabled={false}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            boundBoxFunc={(oldBox, newBox) => {
              const width = Math.max(60, newBox.width);
              const height = Math.max(20, newBox.height);
              handleTransform(selectedId || '', width, height, newBox.x, newBox.y);
              return { ...newBox, width, height };
            }}
          />
        </Layer>
        <Layer listening={false}>
          {guides.vertical && <Line points={[guides.vertical, 0, guides.vertical, PAGE_HEIGHT]} stroke={accentColor} dash={[4, 4]} />}
          {guides.horizontal && <Line points={[0, guides.horizontal, PAGE_WIDTH, guides.horizontal]} stroke={accentColor} dash={[4, 4]} />}
        </Layer>
      </Stage>
      <p className="text-xs text-slate-500 mt-2">Arrastra, suelta o haz doble clic para editar el contenido. El lienzo se ajusta a la cuadrícula para mantener la alineación.</p>
    </div>
  );
};

export { FONT_OPTIONS };
export type { TemplateStyle, ThemeOverrides, FontFamilyId };
