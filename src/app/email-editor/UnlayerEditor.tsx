'use client'

import { Button } from '@tremor/react';
import React, { useRef } from 'react';

import EmailEditor, { EditorRef  } from 'react-email-editor';

export default function UnlayerEditor(){
  const emailEditorRef = useRef<EditorRef>(null);

  const downloadFile = (filename: string, content: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDesignAndHtml = () => {
    const unlayer = emailEditorRef.current?.editor;

    // Export HTML
    unlayer?.exportHtml((data) => {
      const { html } = data;
      downloadFile('design-html.html', html, 'text/html');
    });

    // Save Design JSON
    unlayer?.saveDesign((design: unknown) => {
      const designJson = JSON.stringify(design, null, 2);
      downloadFile('design-template.json', designJson, 'application/json');
    });
  };

  return (
    <div className="flex flex-col gap-2 m-4 flex-1">
       <div className='flex gap-4'>
       <Button onClick={downloadDesignAndHtml} className="w-fit">
          Download Design and HTML
        </Button>
       </div>
      <EmailEditor ref={emailEditorRef} style={{ height: "100%" }} />
    </div>
  );
};