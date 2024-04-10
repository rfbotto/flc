'use client'

import { Button } from '@tremor/react';
import React, { useRef } from 'react';

import EmailEditor, { EditorRef  } from 'react-email-editor';

export default function UnlayerEditor(){
  const emailEditorRef = useRef<EditorRef>(null);

  const exportHtml = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { html } = data;
      console.log('exportHtml', html);
    });
  };

  const saveDesign = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.saveDesign((design: unknown) => {
      console.log('saveDesign', design);
    });
  };

    const loadTemplate = () => {
        const unlayer = emailEditorRef.current?.editor;
        const templateJson = {
            "counters": {
                "u_column": 9,
                "u_row": 5,
                "u_content_heading": 1,
                "u_content_image": 1,
                "u_content_text": 1
            },
            "body": {
                "id": "XSnBI6Pv7M",
                "rows": [
                    {
                        "id": "H9P8n75krT",
                        "cells": [
                            1
                        ],
                        "columns": [
                            {
                                "id": "r1xheS0FEX",
                                "contents": [
                                    {
                                        "id": "EUHGWXe5nE",
                                        "type": "heading",
                                        "values": {
                                            "containerPadding": "10px",
                                            "anchor": "",
                                            "headingType": "h1",
                                            "fontSize": "22px",
                                            "textAlign": "center",
                                            "lineHeight": "140%",
                                            "linkStyle": {
                                                "inherit": true,
                                                "linkColor": "#0000ee",
                                                "linkHoverColor": "#0000ee",
                                                "linkUnderline": true,
                                                "linkHoverUnderline": true
                                            },
                                            "displayCondition": null,
                                            "_meta": {
                                                "htmlID": "u_content_heading_1",
                                                "htmlClassNames": "u_content_heading"
                                            },
                                            "selectable": true,
                                            "draggable": true,
                                            "duplicatable": true,
                                            "deletable": true,
                                            "hideable": true,
                                            "text": "<span>Heading</span>"
                                        }
                                    }
                                ],
                                "values": {
                                    "backgroundColor": "",
                                    "padding": "0px",
                                    "border": {},
                                    "borderRadius": "0px",
                                    "_meta": {
                                        "htmlID": "u_column_1",
                                        "htmlClassNames": "u_column"
                                    }
                                }
                            }
                        ],
                        "values": {
                            "displayCondition": null,
                            "columns": false,
                            "backgroundColor": "",
                            "columnsBackgroundColor": "",
                            "backgroundImage": {
                                "url": "",
                                "fullWidth": true,
                                "repeat": "no-repeat",
                                "size": "custom",
                                "position": "center",
                                "customPosition": [
                                    "50%",
                                    "50%"
                                ]
                            },
                            "padding": "0px",
                            "anchor": "",
                            "hideDesktop": false,
                            "_meta": {
                                "htmlID": "u_row_1",
                                "htmlClassNames": "u_row"
                            },
                            "selectable": true,
                            "draggable": true,
                            "duplicatable": true,
                            "deletable": true,
                            "hideable": true
                        }
                    },
                    {
                        "id": "Hjqb_6xV_G",
                        "cells": [
                            1,
                            1,
                            1
                        ],
                        "columns": [
                            {
                                "id": "B11oKj4hhN",
                                "contents": [],
                                "values": {
                                    "backgroundColor": "",
                                    "padding": "0px",
                                    "border": {},
                                    "borderRadius": "0px",
                                    "_meta": {
                                        "htmlID": "u_column_2",
                                        "htmlClassNames": "u_column"
                                    }
                                }
                            },
                            {
                                "id": "QoBgpXOkKP",
                                "contents": [],
                                "values": {
                                    "backgroundColor": "",
                                    "padding": "0px",
                                    "border": {},
                                    "borderRadius": "0px",
                                    "_meta": {
                                        "htmlID": "u_column_3",
                                        "htmlClassNames": "u_column"
                                    }
                                }
                            },
                            {
                                "id": "ITdj0hRCg9",
                                "contents": [],
                                "values": {
                                    "backgroundColor": "",
                                    "padding": "0px",
                                    "border": {},
                                    "borderRadius": "0px",
                                    "_meta": {
                                        "htmlID": "u_column_4",
                                        "htmlClassNames": "u_column"
                                    }
                                }
                            }
                        ],
                        "values": {
                            "displayCondition": null,
                            "columns": false,
                            "backgroundColor": "",
                            "columnsBackgroundColor": "",
                            "backgroundImage": {
                                "url": "",
                                "fullWidth": true,
                                "repeat": "no-repeat",
                                "size": "custom",
                                "position": "center"
                            },
                            "padding": "0px",
                            "anchor": "",
                            "_meta": {
                                "htmlID": "u_row_2",
                                "htmlClassNames": "u_row"
                            },
                            "selectable": true,
                            "draggable": true,
                            "duplicatable": true,
                            "deletable": true,
                            "hideable": true
                        }
                    },
                    {
                        "id": "bcpRrEFGPK",
                        "cells": [
                            1
                        ],
                        "columns": [
                            {
                                "id": "o426JsSTOV",
                                "contents": [
                                    {
                                        "id": "b1PpuzkXOq",
                                        "type": "image",
                                        "values": {
                                            "containerPadding": "10px",
                                            "anchor": "",
                                            "src": {
                                                "url": "https://cdn.tools.unlayer.com/image/placeholder.png",
                                                "width": 800,
                                                "height": 200
                                            },
                                            "textAlign": "center",
                                            "altText": "",
                                            "action": {
                                                "name": "web",
                                                "values": {
                                                    "href": "",
                                                    "target": "_blank"
                                                }
                                            },
                                            "displayCondition": null,
                                            "_meta": {
                                                "htmlID": "u_content_image_1",
                                                "htmlClassNames": "u_content_image"
                                            },
                                            "selectable": true,
                                            "draggable": true,
                                            "duplicatable": true,
                                            "deletable": true,
                                            "hideable": true
                                        }
                                    }
                                ],
                                "values": {
                                    "backgroundColor": "",
                                    "padding": "0px",
                                    "border": {},
                                    "borderRadius": "0px",
                                    "_meta": {
                                        "htmlID": "u_column_5",
                                        "htmlClassNames": "u_column"
                                    }
                                }
                            }
                        ],
                        "values": {
                            "displayCondition": null,
                            "columns": false,
                            "backgroundColor": "",
                            "columnsBackgroundColor": "",
                            "backgroundImage": {
                                "url": "",
                                "fullWidth": true,
                                "repeat": "no-repeat",
                                "size": "custom",
                                "position": "center"
                            },
                            "padding": "0px",
                            "anchor": "",
                            "_meta": {
                                "htmlID": "u_row_3",
                                "htmlClassNames": "u_row"
                            },
                            "selectable": true,
                            "draggable": true,
                            "duplicatable": true,
                            "deletable": true,
                            "hideable": true
                        }
                    },
                    {
                        "id": "drAF9fL9cN",
                        "cells": [
                            1,
                            1
                        ],
                        "columns": [
                            {
                                "id": "RRm5qgnxgL",
                                "contents": [],
                                "values": {
                                    "backgroundColor": "",
                                    "padding": "0px",
                                    "border": {},
                                    "borderRadius": "0px",
                                    "_meta": {
                                        "htmlID": "u_column_6",
                                        "htmlClassNames": "u_column"
                                    }
                                }
                            },
                            {
                                "id": "FqSPf25DpZ",
                                "contents": [],
                                "values": {
                                    "backgroundColor": "",
                                    "padding": "0px",
                                    "border": {},
                                    "borderRadius": "0px",
                                    "_meta": {
                                        "htmlID": "u_column_7",
                                        "htmlClassNames": "u_column"
                                    }
                                }
                            }
                        ],
                        "values": {
                            "displayCondition": null,
                            "columns": false,
                            "backgroundColor": "",
                            "columnsBackgroundColor": "",
                            "backgroundImage": {
                                "url": "",
                                "fullWidth": true,
                                "repeat": "no-repeat",
                                "size": "custom",
                                "position": "center"
                            },
                            "padding": "0px",
                            "anchor": "",
                            "_meta": {
                                "htmlID": "u_row_4",
                                "htmlClassNames": "u_row"
                            },
                            "selectable": true,
                            "draggable": true,
                            "duplicatable": true,
                            "deletable": true,
                            "hideable": true
                        }
                    },
                    {
                        "id": "9t0qz2E-ht",
                        "cells": [
                            1
                        ],
                        "columns": [
                            {
                                "id": "xiKOZoBR2A",
                                "contents": [
                                    {
                                        "id": "8OVziwFfJP",
                                        "type": "text",
                                        "values": {
                                            "containerPadding": "10px",
                                            "anchor": "",
                                            "fontSize": "14px",
                                            "textAlign": "center",
                                            "lineHeight": "140%",
                                            "linkStyle": {
                                                "inherit": true,
                                                "linkColor": "#0000ee",
                                                "linkHoverColor": "#0000ee",
                                                "linkUnderline": true,
                                                "linkHoverUnderline": true
                                            },
                                            "displayCondition": null,
                                            "_meta": {
                                                "htmlID": "u_content_text_1",
                                                "htmlClassNames": "u_content_text"
                                            },
                                            "selectable": true,
                                            "draggable": true,
                                            "duplicatable": true,
                                            "deletable": true,
                                            "hideable": true,
                                            "text": "<p style=\"line-height: 140%;\">This is a new Text block. Change the text.</p>"
                                        }
                                    }
                                ],
                                "values": {
                                    "backgroundColor": "",
                                    "padding": "0px",
                                    "border": {},
                                    "borderRadius": "0px",
                                    "_meta": {
                                        "htmlID": "u_column_9",
                                        "htmlClassNames": "u_column"
                                    }
                                }
                            }
                        ],
                        "values": {
                            "displayCondition": null,
                            "columns": false,
                            "backgroundColor": "",
                            "columnsBackgroundColor": "",
                            "backgroundImage": {
                                "url": "",
                                "fullWidth": true,
                                "repeat": "no-repeat",
                                "size": "custom",
                                "position": "center"
                            },
                            "padding": "0px",
                            "anchor": "",
                            "_meta": {
                                "htmlID": "u_row_5",
                                "htmlClassNames": "u_row"
                            },
                            "selectable": true,
                            "draggable": true,
                            "duplicatable": true,
                            "deletable": true,
                            "hideable": true
                        }
                    }
                ],
                "headers": [],
                "footers": [],
                "values": {
                    "popupPosition": "center",
                    "popupWidth": "600px",
                    "popupHeight": "auto",
                    "borderRadius": "10px",
                    "contentAlign": "center",
                    "contentVerticalAlign": "center",
                    "contentWidth": "500px",
                    "fontFamily": {
                        "label": "Arial",
                        "value": "arial,helvetica,sans-serif"
                    },
                    "textColor": "#000000",
                    "popupBackgroundColor": "#FFFFFF",
                    "popupBackgroundImage": {
                        "url": "",
                        "fullWidth": true,
                        "repeat": "no-repeat",
                        "size": "cover",
                        "position": "center"
                    },
                    "popupOverlay_backgroundColor": "rgba(0, 0, 0, 0.1)",
                    "popupCloseButton_position": "top-right",
                    "popupCloseButton_backgroundColor": "#DDDDDD",
                    "popupCloseButton_iconColor": "#000000",
                    "popupCloseButton_borderRadius": "0px",
                    "popupCloseButton_margin": "0px",
                    "popupCloseButton_action": {
                        "name": "close_popup",
                        "attrs": {
                            "onClick": "document.querySelector('.u-popup-container').style.display = 'none';"
                        }
                    },
                    "backgroundColor": "#e7e7e7",
                    "preheaderText": "",
                    "linkStyle": {
                        "body": true,
                        "linkColor": "#0000ee",
                        "linkHoverColor": "#0000ee",
                        "linkUnderline": true,
                        "linkHoverUnderline": true
                    },
                    "backgroundImage": {
                        "url": "",
                        "fullWidth": true,
                        "repeat": "no-repeat",
                        "size": "custom",
                        "position": "center"
                    },
                    "_meta": {
                        "htmlID": "u_body",
                        "htmlClassNames": "u_body"
                    }
                }
            },
            "schemaVersion": 16
        }

        unlayer?.loadDesign(templateJson)
    };

  return (
    <div className="flex flex-col gap-2 m-4 flex-1">
       <div className='flex gap-4'>
            <Button onClick={exportHtml} className="w-fit">
                Export HTML
            </Button>
            <Button onClick={saveDesign} className="w-fit">
                Save Design
            </Button>
            <Button onClick={loadTemplate} className="w-fit">
                Load Template
            </Button>
       </div>
      <EmailEditor ref={emailEditorRef} style={{ height: "100%" }} />
    </div>
  );
};