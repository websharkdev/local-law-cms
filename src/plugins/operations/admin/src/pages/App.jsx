import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Flex, Tabs, Typography } from '@strapi/design-system';
import {
  Layouts,
  Page,
  useFetchClient,
  useNotification,
} from '@strapi/strapi/admin';
import { ArrowClockwise } from '@strapi/icons';

import DetailsModal from '../components/DetailsModal';
import OpsTable from '../components/OpsTable';
import { TABS } from '../utils/statuses';

const App = () => {
  const { get, put } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [itemsByTab, setItemsByTab] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const tab = TABS.find((entry) => entry.id === activeTab) || TABS[0];

  const loadTab = useCallback(
    async (tabConfig) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await get(tabConfig.endpoint);
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setItemsByTab((prev) => ({ ...prev, [tabConfig.id]: list }));
      } catch (err) {
        const message =
          err?.response?.data?.error?.message ||
          err?.message ||
          'Failed to load operations data';
        setError(message);
        setItemsByTab((prev) => ({ ...prev, [tabConfig.id]: [] }));
      } finally {
        setLoading(false);
      }
    },
    [get],
  );

  useEffect(() => {
    const current = TABS.find((entry) => entry.id === activeTab) || TABS[0];
    loadTab(current);
  }, [activeTab, loadTab]);

  const handleStatusChange = async (item, status) => {
    if (status === item.status) return;

    setUpdatingId(item.id);
    try {
      const { data } = await put(
        `/operations/${tab.resourceType}/${item.id}/status`,
        { status },
      );

      const updated = data?.data || { ...item, status };
      setItemsByTab((prev) => ({
        ...prev,
        [tab.id]: (prev[tab.id] || []).map((row) =>
          row.id === item.id
            ? { ...row, ...updated, status: updated.status || status }
            : row,
        ),
      }));
      toggleNotification({
        type: 'success',
        message: 'Status updated',
      });
    } catch (err) {
      toggleNotification({
        type: 'danger',
        message:
          err?.response?.data?.error?.message ||
          err?.message ||
          'Failed to update status',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownload = async (item, file) => {
    try {
      const { data, headers } = await get(
        `/operations/${tab.resourceType}/${item.id}/files/${file.id}/download`,
        { responseType: 'blob' },
      );

      const blob = data instanceof Blob ? data : new Blob([data]);
      const disposition = headers?.get?.('content-disposition') || '';
      const match = /filename="?([^"]+)"?/i.exec(disposition);
      const fileName = match?.[1] || file.fileName || 'download';

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      let message = err?.response?.data?.error?.message || err?.message;

      // responseType: 'blob' makes axios deliver error bodies as a Blob too,
      // so the real backend message has to be read out of it manually.
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          message = JSON.parse(text)?.error?.message || message;
        } catch {
          // not JSON, fall back to whatever message we already have
        }
      }

      toggleNotification({
        type: 'danger',
        message: message || 'Failed to download file',
      });
    }
  };

  const items = itemsByTab[tab.id] || [];

  return (
    <Page.Main>
      <Page.Title>Operations</Page.Title>
      <Layouts.Header
        title="Operations"
        subtitle="Transactional requests from local-law. Prisma remains the source of truth."
        primaryAction={
          <Button
            variant="secondary"
            startIcon={<ArrowClockwise />}
            onClick={() => loadTab(tab)}
            loading={loading}
          >
            Refresh
          </Button>
        }
      />
      <Layouts.Content>
        <Box background="neutral0" hasRadius shadow="filterShadow" padding={4}>
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List aria-label="Operations tabs">
              {TABS.map((entry) => (
                <Tabs.Trigger key={entry.id} value={entry.id}>
                  {entry.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {TABS.map((entry) => (
              <Tabs.Content key={entry.id} value={entry.id}>
                <Box paddingTop={4}>
                  {error && activeTab === entry.id ? (
                    <Box
                      padding={4}
                      background="danger100"
                      hasRadius
                      marginBottom={4}
                    >
                      <Typography textColor="danger700">{error}</Typography>
                      <Box paddingTop={2}>
                        <Typography textColor="danger600">
                          Configure LOCAL_LAW_URL and LOCAL_LAW_ADMIN_API_TOKEN,
                          then ensure the local-law admin ops API is available.
                        </Typography>
                      </Box>
                    </Box>
                  ) : null}

                  {loading && activeTab === entry.id ? (
                    <Page.Loading />
                  ) : (
                    <OpsTable
                      items={itemsByTab[entry.id] || []}
                      statuses={entry.statuses}
                      updatingId={updatingId}
                      onOpenDetails={setSelected}
                      onStatusChange={handleStatusChange}
                      onDownload={handleDownload}
                    />
                  )}
                </Box>
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </Box>

        {selected ? (
          <DetailsModal item={selected} onClose={() => setSelected(null)} />
        ) : null}

        <Box paddingTop={4}>
          <Flex gap={2}>
            <Typography variant="pi" textColor="neutral500">
              Showing {items.length} item(s). Payment status is read-only.
              Deletes are not supported.
            </Typography>
          </Flex>
        </Box>
      </Layouts.Content>
    </Page.Main>
  );
};

export default App;
