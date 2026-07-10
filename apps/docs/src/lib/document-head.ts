type DocumentHeadData = {
  description?: string;
  title: string;
};

export function getDocumentHead(loaderData: DocumentHeadData | undefined) {
  if (!loaderData) {
    return {};
  }

  return {
    meta: [
      { title: loaderData.title },
      ...(loaderData.description !== undefined
        ? [{ content: loaderData.description, name: "description" }]
        : []),
    ],
  };
}
