import React from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Modal,
  Typography,
} from '@strapi/design-system';

import { DETAIL_FIELDS, customerLabel, formatDate } from '../utils/statuses';

function pickPayloadFields(item) {
  const keys =
    DETAIL_FIELDS[item?.type] ||
    DETAIL_FIELDS[item?.resourceType] ||
    Object.keys(item?.payload || {});

  const fromPayload = item?.payload || {};
  const picked = {};

  keys.forEach((key) => {
    if (fromPayload[key] !== undefined) {
      picked[key] = fromPayload[key];
    } else if (item?.[key] !== undefined) {
      picked[key] = item[key];
    }
  });

  return Object.keys(picked).length > 0 ? picked : fromPayload;
}

const DetailsModal = ({ item, onClose }) => {
  if (!item) return null;

  const payload = pickPayloadFields(item);
  const generatedText =
    payload.generatedText || item.payload?.generatedText || item.generatedText;

  return (
    <Modal.Root open onOpenChange={(open) => !open && onClose()}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Request details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Flex direction="column" alignItems="stretch" gap={4}>
            <Flex gap={2} wrap="wrap">
              <Badge>{item.type || 'request'}</Badge>
              <Badge active>{item.status}</Badge>
              {item.payment?.status ? (
                <Badge>{`payment: ${item.payment.status}`}</Badge>
              ) : null}
            </Flex>

            <Box>
              <Typography variant="sigma" textColor="neutral600">
                ID
              </Typography>
              <Typography>{item.id}</Typography>
            </Box>

            <Box>
              <Typography variant="sigma" textColor="neutral600">
                Customer
              </Typography>
              <Typography>{customerLabel(item.customer)}</Typography>
              {item.customer?.phone ? (
                <Typography textColor="neutral600">{item.customer.phone}</Typography>
              ) : null}
            </Box>

            <Box>
              <Typography variant="sigma" textColor="neutral600">
                Created
              </Typography>
              <Typography>{formatDate(item.createdAt)}</Typography>
            </Box>

            {item.payment ? (
              <Box>
                <Typography variant="sigma" textColor="neutral600">
                  Payment
                </Typography>
                <Typography>
                  {item.payment.status}
                  {item.payment.amountAed != null
                    ? ` · ${item.payment.amountAed} AED`
                    : ''}
                </Typography>
                {item.payment.stripePaymentIntentId ? (
                  <Typography textColor="neutral600">
                    {item.payment.stripePaymentIntentId}
                  </Typography>
                ) : null}
              </Box>
            ) : null}

            {item.files?.length ? (
              <Box>
                <Typography variant="sigma" textColor="neutral600">
                  Files
                </Typography>
                <Flex direction="column" alignItems="stretch" gap={1}>
                  {item.files.map((file) => (
                    <Typography key={file.id}>
                      {file.fileName}
                      {file.mimeType ? ` (${file.mimeType})` : ''}
                    </Typography>
                  ))}
                </Flex>
              </Box>
            ) : null}

            {generatedText ? (
              <Box>
                <Typography variant="sigma" textColor="neutral600">
                  Generated text
                </Typography>
                <Box
                  padding={3}
                  background="neutral100"
                  hasRadius
                  style={{ maxHeight: 240, overflow: 'auto', whiteSpace: 'pre-wrap' }}
                >
                  <Typography>{String(generatedText)}</Typography>
                </Box>
              </Box>
            ) : null}

            <Box>
              <Typography variant="sigma" textColor="neutral600">
                Payload
              </Typography>
              {/* Plain <pre>, not JSONInput: JSONInput pulls in CodeMirror,
                  which currently crashes on duplicate @codemirror/state
                  instances (strapi/strapi#26951). */}
              <Box
                padding={3}
                background="neutral100"
                hasRadius
                style={{ maxHeight: 320, overflow: 'auto' }}
              >
                <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(payload ?? {}, null, 2)}
                </pre>
              </Box>
            </Box>
          </Flex>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose} variant="tertiary">
            Close
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default DetailsModal;
