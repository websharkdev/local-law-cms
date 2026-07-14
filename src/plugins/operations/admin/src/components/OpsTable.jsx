import React from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  SingleSelect,
  SingleSelectOption,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography,
} from '@strapi/design-system';
import { Download, Eye } from '@strapi/icons';

import { customerLabel, formatDate } from '../utils/statuses';

const OpsTable = ({
  items,
  statuses,
  onOpenDetails,
  onStatusChange,
  onDownload,
  updatingId,
}) => {
  if (!items.length) {
    return (
      <Box padding={6} background="neutral0" hasRadius shadow="filterShadow">
        <Typography textColor="neutral600">No requests found.</Typography>
      </Box>
    );
  }

  return (
    <Table colCount={7} rowCount={items.length + 1}>
      <Thead>
        <Tr>
          <Th>
            <Typography variant="sigma">ID</Typography>
          </Th>
          <Th>
            <Typography variant="sigma">Customer</Typography>
          </Th>
          <Th>
            <Typography variant="sigma">Status</Typography>
          </Th>
          <Th>
            <Typography variant="sigma">Payment</Typography>
          </Th>
          <Th>
            <Typography variant="sigma">Created</Typography>
          </Th>
          <Th>
            <Typography variant="sigma">Files</Typography>
          </Th>
          <Th>
            <Typography variant="sigma">Actions</Typography>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((item) => (
          <Tr key={item.id}>
            <Td>
              <Typography fontWeight="bold" textColor="neutral800">
                {String(item.id).slice(0, 12)}
                {String(item.id).length > 12 ? '…' : ''}
              </Typography>
            </Td>
            <Td>
              <Typography textColor="neutral800">
                {customerLabel(item.customer)}
              </Typography>
            </Td>
            <Td>
              <SingleSelect
                size="S"
                value={item.status}
                disabled={updatingId === item.id}
                onChange={(value) => onStatusChange(item, value)}
              >
                {statuses.map((status) => (
                  <SingleSelectOption key={status} value={status}>
                    {status}
                  </SingleSelectOption>
                ))}
                {!statuses.includes(item.status) ? (
                  <SingleSelectOption value={item.status}>
                    {item.status}
                  </SingleSelectOption>
                ) : null}
              </SingleSelect>
            </Td>
            <Td>
              {item.payment?.status ? (
                <Badge>{item.payment.status}</Badge>
              ) : (
                <Typography textColor="neutral500">—</Typography>
              )}
            </Td>
            <Td>
              <Typography textColor="neutral800">
                {formatDate(item.createdAt)}
              </Typography>
            </Td>
            <Td>
              <Flex gap={1} wrap="wrap">
                {(item.files || []).length === 0 ? (
                  <Typography textColor="neutral500">—</Typography>
                ) : (
                  item.files.map((file) => (
                    <IconButton
                      key={file.id}
                      label={`Download ${file.fileName}`}
                      onClick={() => onDownload(item, file)}
                    >
                      <Download />
                    </IconButton>
                  ))
                )}
              </Flex>
            </Td>
            <Td>
              <Button
                size="S"
                variant="tertiary"
                startIcon={<Eye />}
                onClick={() => onOpenDetails(item)}
              >
                Details
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default OpsTable;
